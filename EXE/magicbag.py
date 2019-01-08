# Learn more from multiAbaqus module
# Call this multiAbaqus.py in the following format:
#            0                         1                                   2                     3-machine_id   4-start_date   5-days        6-intervals and interval alias          
# python magicbag.py "throughput,elasped,setup,poweroff" "throughput/(elasped-setup-poweroff)"      "1"          "2018-7-16"     7      "08:00:00-12:00:00-1,13:30:00-17:30:00-2"
import importlib
from analysiscore import core
magicbag = importlib.import_module('.magicbag.magicbag', core)

def main():
    magicbag.main()


if __name__ == "__main__":
    main()
