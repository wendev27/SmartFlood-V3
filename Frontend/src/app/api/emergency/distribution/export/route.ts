import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { assignedBarangayForUser } from "@/lib/barangayScope";
import { getDashboardViewer, dashboardViewerRole } from "@/lib/dashboardViewer";
import { getCampaign, getCampaignBarangayItem, getCampaignProgress, refreshCampaignExpiration, reconcileCampaignDistributionReadiness } from "@/lib/emergencyCampaigns";
import { getDistributionHistoryForViewerByBatch } from "@/lib/emergencyDistribution";

type ExportDistribution = {
  family_name?: string | null;
  family_head_name?: string | null;
  barangay_name?: string | null;
  verified_by_name?: string | null;
  verified_at?: string | null;
  status?: string | null;
};

const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF0F61FF" } };
const summaryFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFEFF6FF" } };

export async function GET(request: NextRequest) {
  try {
    const viewer = await getDashboardViewer(request);
    if (!viewer) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const role = dashboardViewerRole(viewer);
    if (role !== "barangay" && role !== "super" && role !== "cswdd") {
      return NextResponse.json({ success: false, error: "You do not have access to relief distribution exports." }, { status: 403 });
    }

    const batchId = String(request.nextUrl.searchParams.get("batchId") ?? request.nextUrl.searchParams.get("batch_id") ?? "").trim();
    if (!batchId) {
      return NextResponse.json({ success: false, error: "batchId is required." }, { status: 400 });
    }

    const campaign = await getCampaign(batchId);
    if (!campaign) {
      return NextResponse.json({ success: false, error: "Selected relief campaign was not found." }, { status: 404 });
    }

    const effectiveCampaign = await reconcileCampaignDistributionReadiness(await refreshCampaignExpiration(campaign, viewer), viewer);
    const progress = await getCampaignProgress(batchId, role === "barangay" ? viewer : null);
    let exportBarangayName = "All Barangays";

    if (role === "barangay") {
      const barangay = assignedBarangayForUser(viewer);
      if (!barangay) {
        return NextResponse.json({ success: false, error: "Your account is not assigned to a barangay." }, { status: 403 });
      }

      const item = await getCampaignBarangayItem(batchId, barangay.barangay_id);
      if (!item) {
        return NextResponse.json({ success: false, error: "Selected relief campaign is not available to your barangay." }, { status: 403 });
      }
      exportBarangayName = barangay.barangay_name || String(item.barangay_name ?? "Assigned Barangay");
    } else if (progress.barangays.length === 1) {
      exportBarangayName = progress.barangays[0]?.barangay_name || exportBarangayName;
    }

    const history = await getDistributionHistoryForViewerByBatch(viewer, batchId);
    if (history.status !== "OK") {
      return NextResponse.json({ success: false, error: history.reason ?? "Unable to export relief distribution records." }, { status: 403 });
    }

    const distributions = history.distributions as ExportDistribution[];
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SmartFlood";
    workbook.created = new Date();

    const distributionSheet = workbook.addWorksheet("Relief Distribution", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    distributionSheet.columns = [
      { header: "No.", key: "no", width: 8 },
      { header: "Family", key: "family", width: 30 },
      { header: "Family Head", key: "family_head", width: 30 },
      { header: "Barangay", key: "barangay", width: 24 },
      { header: "Relief Program", key: "relief_program", width: 30 },
      { header: "Strategy", key: "strategy", width: 22 },
      { header: "Received At", key: "received_at", width: 24 },
      { header: "Verified By", key: "verified_by", width: 26 },
      { header: "Status", key: "status", width: 16 },
    ];
    styleHeaderRow(distributionSheet.getRow(1));

    distributions.forEach((record, index) => {
      distributionSheet.addRow({
        no: index + 1,
        family: String(record.family_name ?? "Family"),
        family_head: String(record.family_head_name ?? "Not recorded"),
        barangay: String(record.barangay_name ?? exportBarangayName),
        relief_program: effectiveCampaign.plan_name,
        strategy: formatStatus(effectiveCampaign.plan_id),
        received_at: formatDateTime(record.verified_at),
        verified_by: String(record.verified_by_name ?? "Not recorded"),
        status: formatStatus(record.status),
      });
    });
    if (distributions.length === 0) distributionSheet.addRow({});

    distributionSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = lightBorder();
      });
    });

    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [{ width: 30 }, { width: 44 }];
    const received = distributions.filter((record) => record.status === "received").length;
    const rejected = distributions.filter((record) => record.status === "rejected").length;
    const summaryRows: Array<[string, string | number]> = [
      ["SmartFlood Relief Distribution Report", ""],
      ["Barangay:", exportBarangayName],
      ["Relief Program:", effectiveCampaign.plan_name],
      ["Strategy:", formatStatus(effectiveCampaign.plan_id)],
      ["Distribution Date:", formatDate(new Date().toISOString())],
      ["Campaign Status:", formatStatus(effectiveCampaign.status)],
      ["Total Families Served:", distributions.length],
      ["Total Received:", received],
      ["Total Rejected:", rejected],
      ["Generated At:", formatDateTime(new Date().toISOString())],
    ];

    summaryRows.forEach((row, index) => {
      const excelRow = summarySheet.addRow(row);
      excelRow.height = index === 0 ? 26 : 20;
      excelRow.eachCell((cell, cellIndex) => {
        cell.border = lightBorder();
        cell.alignment = { vertical: "middle", wrapText: true };
        if (index === 0) {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
          cell.fill = headerFill;
        } else if (cellIndex === 1) {
          cell.font = { bold: true, color: { argb: "FF14385F" } };
          cell.fill = summaryFill;
        }
      });
    });
    summarySheet.mergeCells("A1:B1");

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const filename = `${filenameBarangay(exportBarangayName)}ReliefData(${formatDateForFilename(new Date())}).xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to export relief distribution records." }, { status: 500 });
  }
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = headerFill;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = lightBorder();
  });
}

function lightBorder() {
  return {
    top: { style: "thin" as const, color: { argb: "FFDCE9F9" } },
    left: { style: "thin" as const, color: { argb: "FFDCE9F9" } },
    bottom: { style: "thin" as const, color: { argb: "FFDCE9F9" } },
    right: { style: "thin" as const, color: { argb: "FFDCE9F9" } },
  };
}

function filenameBarangay(value: string) {
  const normalized = String(value || "Barangay")
    .replace(/^barangay\s+/i, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
  return `brgy${normalized || "Relief"}`;
}

function formatDateForFilename(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(value?: string | null) {
  const text = String(value ?? "").replace(/_/g, " ").trim();
  return text ? text.replace(/\b\w/g, (char) => char.toUpperCase()) : "Unknown";
}
