
import sys
import os
sys.path.append(os.getcwd())

from app.core.serialization import serialize_doc

class Foo:
    bar = 1

try:
    print("Testing serialize_doc with a Class...")
    res = serialize_doc(Foo)
    print(f"Result type: {type(res)}")
    print(f"Result: {res}")
except Exception as e:
    print(f"Crashed: {e}")

try:
    print("\nTesting serialize_doc with an instance...")
    f = Foo()
    res = serialize_doc(f)
    print(f"Result type: {type(res)}")
    print(f"Result: {res}")
except Exception as e:
    print(f"Crashed: {e}")
