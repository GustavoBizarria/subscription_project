from sqlalchemy.orm import Session
import models, schemas

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate):
    db_subscription = models.Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def list_subscription(db: Session, skip: int = 0, limit = 100):
    return db.query(models.Subscription).offset(skip).limit(limit).all()

def search_subscription(db: Session, subscription_id: int):
    return db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()

def update_subscription(db: Session, subscription_id: int, data: schemas.SubscriptionCreate):
    db_subscription = search_subscription(db, subscription_id)
    if db_subscription is None:
        return None
    db.delete(db_subscription)
    db.commit()
    return db_subscription