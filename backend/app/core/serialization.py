from datetime import datetime
from bson import ObjectId
from beanie import PydanticObjectId

def serialize_doc(doc, visited=None):
    """Deeply convert OIDs and datetimes to strings for JSON serialization with recursion guard"""
    if doc is None:
        return None
    
    if visited is None:
        visited = set()
    
    # Simple recursion guard for objects (not primitives)
    if id(doc) in visited:
        return "<Circular Reference>"
    
    if isinstance(doc, (list, tuple)):
        return [serialize_doc(item, visited) for item in doc]
    
    if isinstance(doc, dict):
        # We don't want to add the dict itself to visited if it's just a container 
        # but for complex dicts it helps.
        return {k: serialize_doc(v, visited) for k, v in doc.items()}

    # For complex objects, we add them to visited
    if hasattr(doc, "__dict__") or hasattr(doc, "dict") or hasattr(doc, "model_dump"):
        visited.add(id(doc))

    if isinstance(doc, (PydanticObjectId, ObjectId)):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
        
    if hasattr(doc, "dict") and callable(doc.dict): # Beanie / Pydantic v1
        res = doc.dict()
        if hasattr(doc, "id") and doc.id:
            res["id"] = str(doc.id)
        return serialize_doc(res, visited)
        
    if hasattr(doc, "model_dump") and callable(doc.model_dump): # Pydantic v2
        res = doc.model_dump()
        if hasattr(doc, "id") and doc.id:
            res["id"] = str(doc.id)
        return serialize_doc(res, visited)
    
    # Primitive types
    if isinstance(doc, (str, int, float, bool)):
        return doc

    if hasattr(doc, "__dict__"):
        return serialize_doc(doc.__dict__, visited)
        
    return str(doc)
