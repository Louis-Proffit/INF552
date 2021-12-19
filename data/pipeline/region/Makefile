EXEC=regions_1 regions_2
PYTHON_DIR=../formaters/
PYTHON=python

all: $(EXEC:=.output.csv)

regions_1.output.csv: regions_1.raw.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 11 0 1 17 19 21 23 25 27 29 31 33 35 37 39 41 43 45 47 49 51 53 55 57 59 61 63 65 67 69 71 73 75 77 79 81

regions_2.output.csv: regions_2.raw.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 2 0 1 17 19 21 23 25 27

clean:
	del *.output.csv