import unittest
from Analysiscore.lib.api import dbapi
from Analysiscore.lib.kps_anly import rules
from Analysiscore.magicbag import magicbag

def suite():
    test_suite = unittest.TestSuite()
    # add unittest

    # dbapi
    test_suite.addTest(unittest.makeSuite(dbapi._test))

    # rules
    test_suite.addTest(unittest.makeSuite(rules._test))

    # multiAbaqus
    test_suite.addTest(unittest.makeSuite(magicbag._test))

    return test_suite


if __name__ == "__main__":
    mySuit = suite()

    runner = unittest.TextTestRunner()
    runner.run(mySuit)