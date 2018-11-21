# Learn more from getDataByTime module
# Call this getDataByTime.py in the following format:
# argv: start_date start_time end_date end_time data_address machine_id
# python getDataByTime.py "2018-7-30" "08:00:00" "2018-7-30" "09:00:00" "pace" "1"
from Analysiscore.getDataByTime import getDataByTime

def main():
    getDataByTime.main()


if __name__ == "__main__":
    main()
