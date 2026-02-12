from datetime import datetime
from bson import ObjectId
from beanie import PydanticObjectId

def serialize_doc(doc, ancestors=None):
    """Deeply convert OIDs and datetimes to strings for JSON serialization with recursion guard (Path-based)"""
    if doc is None:
        return None
    
    if ancestors is None:
        ancestors = set()
    
    # Check for circular reference (only blocks if current object is already in the path)
    doc_id = id(doc)
    if doc_id in ancestors:
        return "<Circular Reference>"
    
    # Prepare ancestors for children (add current object logic)
    # We only track containers/objects to avoid overhead
    is_complex = isinstance(doc, (list, tuple, dict)) or hasattr(doc, "__dict__") or hasattr(doc, "dict") or hasattr(doc, "model_dump")
    
    child_ancestors = ancestors
    if is_complex:
        child_ancestors = ancestors | {doc_id}

    if isinstance(doc, (list, tuple)):
        return [serialize_doc(item, child_ancestors) for item in doc]
    
    if isinstance(doc, dict):
        return {k: serialize_doc(v, child_ancestors) for k, v in doc.items()}
    
    if isinstance(doc, (PydanticObjectId, ObjectId)):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
        
    if hasattr(doc, "dict") and callable(doc.dict): # Beanie / Pydantic v1
        res = doc.dict()
        if hasattr(doc, "id") and doc.id:
            res["id"] = str(doc.id)
        return serialize_doc(res, child_ancestors)
        
    if hasattr(doc, "model_dump") and callable(doc.model_dump): # Pydantic v2
        res = doc.model_dump()
        if hasattr(doc, "id") and doc.id:
            res["id"] = str(doc.id)
        return serialize_doc(res, child_ancestors)
    
    # Primitive types
    if isinstance(doc, (str, int, float, bool)):
        return doc

    if hasattr(doc, "__dict__"):
        return serialize_doc(doc.__dict__, child_ancestors)
        
    return str(doc)
