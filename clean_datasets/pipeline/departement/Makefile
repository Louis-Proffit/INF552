EXEC=departements_1 departements_2
PYTHON_DIR=../formaters/
RELATION_REGION=../relations/region_departement.csv
PYTHON=python

all: $(EXEC:=.output.csv)

departements_1.developped.csv: departements_1.raw.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 11 0 1 17 19 21 23 25 27 29 31 33 35 37 39 41 43 45 47 49 51 53 55 57 59 61 63 65 67 69 71 73 75 77 79 81

departements_2.developped.csv: departements_2.raw.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 2 0 1 17 19 21 23 25 27

%.output.csv: %.developped.csv
	@ $(PYTHON) $(PYTHON_DIR)add_parent_column.py $< $(RELATION_REGION) $@ id_area id_departement name_departement id_region name_region

clean:
	del *.developped.csv
	del *.output.csv