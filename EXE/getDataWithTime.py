# Learn more from getDataByTime module
# Call this getDataByTime.py in the following format:
# argv: start_date start_time end_date end_time type machine_id options
# python getDataWithTime.py "2018-7-16" "14:30:00" "2018-7-16" "15:00:00" "pace" "1"  "{'min': 0, 'max': 900}"
import importlib
from analysiscore import core
getDataWithTime = importlib.import_module('.getDataByTime.getDataWithTime', core)

def main():
    getDataWithTime.main()


if __name__ == "__main__":
    main()
