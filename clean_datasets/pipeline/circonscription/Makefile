EXEC=circonscriptions_1 circonscriptions_2
PYTHON_DIR=../formaters/
RELATION_DEPARTEMENT=../relations/departement_circonscription.csv
RELATION_REGION=../relations/region_departement.csv
PYTHON=python

all: $(EXEC:=.output.csv)

%.formated.csv: %.raw.csv
	@ python $(PYTHON_DIR)concatenate_composite_columns.py $< $@ 0 2 1 3

circonscriptions_1.developped.csv: circonscriptions_1.formated.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 11 0 1 22 24 26 29 31 33 36 38 40 43 45 47 50 52 54 57 59 61 64 66 68 71 73 75 78 80 82 85 87 89 92 94 96

circonscriptions_2.developped.csv: circonscriptions_2.formated.csv
	@ $(PYTHON) $(PYTHON_DIR)develop_data.py $< $@ 2 0 1 22 24 26 29 31 33

%.output.csv: %.developped.csv
	@ $(PYTHON) $(PYTHON_DIR)add_parent_column.py $< $(RELATION_DEPARTEMENT) $@ id_area id_circonscription name_circonscription id_departement name_departement
	@ $(PYTHON) $(PYTHON_DIR)add_parent_column.py $@ $(RELATION_REGION) $@ id_departement id_departement name_departement id_region name_region

clean:
	del *.formated.csv
	del *.developped.csv
	del *.output.csv