from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from database import Base

class Subscription(Base):
    __tablename__ = "subscription"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    value = Column(Float)
    cycle_charge = Column(String)
    first_date_charge = Column(Date)
    active = Column(Boolean, default=True)
    