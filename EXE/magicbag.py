# Learn more from multiAbaqus module
# Call this multiAbaqus.py in the following format:
# argv: start_date start_time end_date end_time machine_id variables recipe
# python magicbag.py "2018-7-30" "08:00:00" "2018-7-30" "09:00:00" "1" "throughput,elasped,setup,poweroff" "throughput/(elasped-setup-poweroff)"
import importlib
from analysiscore import core
magicbag = importlib.import_module('.magicbag.magicbag', core)

def main():
    magicbag.main()


if __name__ == "__main__":
    main()
