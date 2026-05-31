"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { getFloodStatusColor, getFloodStatusLabel } from "@/lib/statusStyles";
import type { FloodHistoryRow } from "@/services/floodService";
import styles from "./FloodHeatmapMap.module.css";

type FloodHeatmapMapProps = {
  readings: FloodHistoryRow[];
};

const fallbackCenter: [number, number] = [14.62202, 121.0528];

export function FloodHeatmapMap({ readings }: FloodHeatmapMapProps) {
  const validReadings = useMemo(() => readings.filter((reading) =>
    reading.lat != null && reading.lng != null
  ), [readings]);

  const center = useMemo<[number, number]>(() => {
    if (validReadings.length === 0) return fallbackCenter;

    const totals = validReadings.reduce((sum, reading) => ({
      lat: sum.lat + Number(reading.lat),
      lng: sum.lng + Number(reading.lng),
    }), { lat: 0, lng: 0 });

    return [totals.lat / validReadings.length, totals.lng / validReadings.length];
  }, [validReadings]);

  return (
    <MapContainer className={styles.mapCanvas} center={center} zoom={14} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validReadings.map((reading) => {
        const tone = getFloodStatusColor(reading.computedStatus, reading.waterLevelM);
        return (
          <CircleMarker
            center={[Number(reading.lat), Number(reading.lng)]}
            fillColor={tone}
            fillOpacity={0.42}
            key={reading.sensorId}
            pathOptions={{ color: tone, weight: 2 }}
            radius={18}
          >
            <Popup>
              <div className={styles.popup}>
                <strong>{reading.sensorName}</strong>
                <span>{reading.sensorId}</span>
                <span>{reading.barangayName}</span>
                {reading.street ? <span>{reading.street}</span> : null}
                <span>Water: <b style={{ color: tone }}>{formatWaterLevel(reading.waterLevelM)}</b></span>
                <span>Level: <b style={{ color: tone }}>{getFloodStatusLabel(reading.computedStatus, reading.waterLevelM)}</b></span>
                <span>Updated: {formatTimestamp(reading.createdAt)}</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

function formatWaterLevel(value: number | null) {
  return value == null ? "No reading" : `${value.toFixed(2)}m`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "No reading";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
