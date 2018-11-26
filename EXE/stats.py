# Learn more from stats module
# Call this stats.py in the following format:
# argv: start_date start_time end_date end_time data_address machine_id
# python stats.py "2018-7-30" "08:00:00" "2018-7-30" "09:00:00" "pace" "1"
import importlib
from analysiscore import core
stats = importlib.import_module('.stats.stats', core)

def main():
    stats.main()

def test():
    stats.test()

if __name__ == "__main__":
    main()
