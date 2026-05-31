from __future__ import annotations

import unittest

from app.engine import generate_recommendations


class RecommendationEngineTests(unittest.TestCase):
    def test_prioritizes_high_risk_barangay_and_respects_inventory(self) -> None:
        sensors = [
            {"_id": "tanong-sensor", "barangayName": "Tanong"},
            {"_id": "catmon-sensor", "barangayName": "Catmon"},
        ]
        readings = [
            {"_id": "tanong-sensor", "doc": {"waterLevelM": 1.2}},
            {"_id": "catmon-sensor", "doc": {"waterLevelM": 0.2}},
        ]
        families = [
            {"barangay_id": 1, "pwd_count": 1, "total_family_members": 5},
            {"barangay_id": 2, "total_family_members": 3},
        ]
        inventory = {"family_food_packs": 2, "medicine_kits": 1, "relief_goods_individual": 6}

        rows = generate_recommendations(sensors, readings, families, inventory)

        self.assertEqual(rows[0]["barangay_name"], "Barangay Tanong")
        self.assertEqual(rows[0]["risk_level"], "severity")
        self.assertIn("Severity flood risk detected", rows[0]["analysis_reason"])
        self.assertLessEqual(sum(row["recommended_family_food_packs"] for row in rows), 2)
        self.assertLessEqual(sum(row["recommended_medicine_kits"] for row in rows), 1)
        self.assertLessEqual(sum(row["recommended_relief_goods_individual"] for row in rows), 6)
        for row in rows:
            self.assertIsInstance(row["recommended_family_food_packs"], int)
            self.assertIsInstance(row["recommended_medicine_kits"], int)
            self.assertIsInstance(row["recommended_relief_goods_individual"], int)

    def test_generates_known_barangays_without_data(self) -> None:
        rows = generate_recommendations(
            [], [], [], {"family_food_packs": 3, "medicine_kits": 0, "relief_goods_individual": 0}
        )

        self.assertEqual(len(rows), 3)
        self.assertTrue(all(row["risk_level"] == "normal" for row in rows))
        self.assertIn("No latest sensor reading available", rows[0]["analysis_reason"])

    def test_exposes_ahp_fuzzy_and_readable_reasoning_details(self) -> None:
        rows = generate_recommendations(
            [{"_id": "tanong-sensor", "barangayName": "Tanong"}],
            [{"_id": "tanong-sensor", "doc": {"waterLevelM": 0.8}}],
            [{"barangay_id": 1, "infant_count": 2, "elderly_count": 1, "pwd_count": 1}],
            {"family_food_packs": 1, "medicine_kits": 1, "relief_goods_individual": 1},
        )

        tanong = next(row for row in rows if row["barangay_name"] == "Barangay Tanong")
        self.assertEqual(tanong["risk_level"], "flood_warning")
        self.assertEqual(tanong["ahp_breakdown"]["weights"]["infant"], 0.22)
        self.assertEqual(tanong["ahp_breakdown"]["contributions"]["infant"], 0.44)
        self.assertEqual(tanong["ahp_breakdown"]["total_vulnerability_score"], 0.82)
        self.assertEqual(tanong["fuzzy_explanation"]["risk_label"], "Flood warning")
        self.assertEqual(tanong["fuzzy_explanation"]["memberships"]["flood_warning"], 1.0)
        self.assertEqual(len(tanong["reasoning_steps"]), 3)

    def test_rounded_allocations_remain_within_available_inventory(self) -> None:
        rows = generate_recommendations(
            [],
            [],
            [
                {"barangay_id": 1, "total_family_members": "10.8"},
                {"barangay_id": 2, "total_family_members": "9.6"},
                {"barangay_id": 3, "total_family_members": "8.4"},
            ],
            {"family_food_packs": 2, "medicine_kits": 2, "relief_goods_individual": 7},
        )

        self.assertLessEqual(sum(row["recommended_family_food_packs"] for row in rows), 2)
        self.assertLessEqual(sum(row["recommended_medicine_kits"] for row in rows), 2)
        self.assertLessEqual(sum(row["recommended_relief_goods_individual"] for row in rows), 7)


if __name__ == "__main__":
    unittest.main()
