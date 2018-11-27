from sys import platform
if platform == "linux" or platform == "linux2":
    import Analysiscore_linux as Analysiscore
elif platform == "darwin":
    import Analysiscore_mac as Analysiscore

    
core = Analysiscore.__package__
