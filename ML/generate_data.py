import pandas as pd
import numpy as np

def generate_data(n_samples=1000):
    np.random.seed(42)
    need = np.random.uniform(10, 500, n_samples)
    hunger = np.random.uniform(0.1, 1.0, n_samples)
    distance = np.random.uniform(0.5, 30.0, n_samples)
    routeTime = distance * np.random.uniform(2.0, 5.0, n_samples)
    trafficFactor = np.random.uniform(0.8, 2.5, n_samples)
    matchProb = np.random.uniform(0.2, 1.0, n_samples)
    spoilageRisk = np.random.uniform(0.0, 1.0, n_samples)

    # Heuristic score for weak supervision
    raw_score = (
        0.30 * (need / 200.0) +
        0.20 * hunger +
        0.20 * (1.0 / (routeTime / 10 + 1.0)) +
        0.20 * matchProb -
        0.10 * spoilageRisk
    )
    score = np.clip(raw_score * 1.5, 0, 1)

    df = pd.DataFrame({
        'need': need,
        'hunger': hunger,
        'distance': distance,
        'routeTime': routeTime,
        'trafficFactor': trafficFactor,
        'matchProb': matchProb,
        'spoilageRisk': spoilageRisk,
        'score': score
    })
    df.to_csv('synthetic_data.csv', index=False)
    print("Generated synthetic_data.csv")

if __name__ == "__main__":
    generate_data()
