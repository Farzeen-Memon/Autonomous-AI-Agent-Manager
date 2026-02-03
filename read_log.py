
import sys

def read_log(path):
    encodings = ['utf-8', 'utf-16', 'utf-16le', 'cp1252']
    match = None
    for enc in encodings:
        try:
            with open(path, 'r', encoding=enc) as f:
                content = f.read()
                print(f"Successfully read with {enc}")
                print(content[-2000:]) # Print last 2000 chars
                return
        except Exception as e:
            continue
    print("Failed to read log file with standard encodings.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_log(sys.argv[1])
    else:
        print("Usage: python read_log.py <path>")
