from datetime import datetime
from bson import ObjectId
from beanie import PydanticObjectId

def serialize_doc(doc):
    """Deeply convert OIDs and datetimes to strings for JSON serialization"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    if isinstance(doc, (PydanticObjectId, ObjectId)):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    if hasattr(doc, "dict") and callable(doc.dict): # Pydantic v1 / Beanie
        res = doc.dict()
        if hasattr(doc, "id"):
            res["id"] = str(doc.id)
        return serialize_doc(res)
    if hasattr(doc, "model_dump") and callable(doc.model_dump): # Pydantic v2
        res = doc.model_dump()
        if hasattr(doc, "id"):
            res["id"] = str(doc.id)
        return serialize_doc(res)
    if hasattr(doc, "__dict__"):
        return serialize_doc(doc.__dict__)
    return doc
