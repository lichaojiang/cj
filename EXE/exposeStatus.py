import json
import importlib
from analysiscore import core
status = importlib.import_module('.lib.util.status', core)

print(json.dumps(status.status))