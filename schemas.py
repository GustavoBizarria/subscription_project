from pydantic import BaseModel 
from datetime import date

class SubscriptionBase(BaseModel):
    name: str
    category: str
    value: float 
    cycle_charge: str
    first_date_charge : date

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionResponse(SubscriptionBase):
    id: int
    active: bool

    class Config:
        from_attributes = True
