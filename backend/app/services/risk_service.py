def calculate_risk_score(
    severity: str,
    people_affected: int,
    disaster_type: str,
) -> int:

    severity_scores = {
        "low": 20,
        "medium": 40,
        "high": 70,
        "critical": 90,
    }

    disaster_scores = {
        "flood": 10,
        "fire": 15,
        "earthquake": 20,
        "cyclone": 20,
        "landslide": 15,
        "other": 5,
    }

    severity_score = severity_scores.get(
        severity.lower(),
        20,
    )

    disaster_score = disaster_scores.get(
        disaster_type.lower(),
        5,
    )

    people_score = min(
        people_affected // 10,
        20,
    )

    total_score = (
        severity_score
        + disaster_score
        + people_score
    )

    return min(total_score, 100)


def get_risk_level(score: int) -> str:

    if score >= 80:
        return "critical"

    if score >= 60:
        return "high"

    if score >= 30:
        return "medium"

    return "low"

