from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/subscription", response_model=schemas.SubscriptionResponse)
def create(subscription: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    return crud.create_subscription(db, subscription)

@app.get("/subscription", response_model=list[schemas.SubscriptionResponse])
def list(db: Session = Depends(get_db)):
    return crud.create_subscription(db)

@app.get("/subscription/{subscription_id}", response_model=schemas.SubscriptionResponse)
def search(subscription_id: int, db: Session = Depends(get_db)):
    return crud.create_subscription(db)

@app.put("/subscription/{subscription_id}", response_model=schemas.SubscriptionResponse)
def update(subscription_id: int, dados: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    result = crud.update_subscription(db, subscription_id, dados)
    if result is None:
        raise HTTPException(status_code=404, detail="subscription not found")
    return result

@app.delete("/subscription/{subscription_id}", response_model=schemas.SubscriptionResponse)
def delete(subscription_id: int, db:Session = Depends(get_db)):
    result = crud.delete_subscription(db, subscription_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message":"Subscription successfully deleted"}