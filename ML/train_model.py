import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

def train():
    df = pd.read_csv('synthetic_data.csv')
    X = df[['need', 'hunger', 'distance', 'routeTime', 'trafficFactor', 'matchProb', 'spoilageRisk']]
    y = df['score']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, 'priority_model.joblib')
    print("Model trained and saved to priority_model.joblib")

if __name__ == "__main__":
    train()
