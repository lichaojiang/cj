from sys import platform

def func():
    if platform == "linux" or platform == "linux2":
        import Analysiscore_linux as Analysiscore
    elif platform == "darwin":
        import Analysiscore_mac as Analysiscore

    return Analysiscore

if __name__ == "__main__":
    func()