import pandas as pd
import sys
import progress_bar as pb


""" 

Merges the columns id (id_circonscription and id_departement) and name (name_circonscription and name_departement)

"""

def load_args():
    args = sys.argv
    if (len(args) != 2 + 2 + 2 + 1):
        print("Usage : python reformater.py [input_file] [output_file] [id_dep] [id_cir] [nom_dep] [nom_cir]")
    input_file = args[1]
    output_file = args[2]
    if not(input_file.endswith('.csv')):
        print("Input file must be .csv")
        exit()
    if not(output_file.endswith('.csv')):
        print("Output file must be .csv")
        exit()
    indexes = args[3:] # It is still considered as caracters
    indexes = [int(i) for i in indexes] # It is int now
    return input_file, output_file, indexes

def load_input_file(input_file):
    dataframe = pd.read_csv(input_file, delimiter=';', low_memory=False)
    return dataframe

def create_column_id(df, index_dep, index_circ):
    df.insert(0, "id_area", "")
    
    def set_id(row, index_dep, index_circ):
        id_dep = str(row.iloc[index_dep + 1])
        id_circ = str(row.iloc[index_circ + 1])
        composite = id_dep
        if (len(id_circ)  == 1):
            composite += "00" + id_circ
        elif (len(id_circ) == 2):
            composite += "0" + id_circ
        elif(len(id_circ) == 3):
            composite += id_circ
        else :
            print("Incoherence : " + row)
        row["id_area"] = composite
        pb.progress(row.name)
        return row
    
    df = df.apply(lambda row : set_id(row, index_dep, index_circ), axis =1)
    return df

def create_column_nom(df, index_dep, index_circ):
    df.insert(1, "name_area", "")
    
    def set_nom(row, index_dep, index_circ):
        nom_dep = row.iloc[index_dep + 2]
        nom_circ = row.iloc[index_circ + 2]
        row["name_area"] = nom_dep + " | " + nom_circ
        pb.progress(row.name + row_count)
        return row
    
    df = df.apply(lambda row : set_nom(row, index_dep, index_circ), axis =1)
    return df


def save_output(df, output_file):
    df.to_csv(output_file, index=False, sep=';')
    pb.progress(2 * row_count)
    return


pb.init(1, _prefix="Concatenate columns \t")
pb.progress(0)
input_file, output_file, indexes = load_args()

dataframe = load_input_file(input_file)

row_count = dataframe.shape[0]
pb.set_length(2 * row_count)

dataframe = create_column_id(dataframe, indexes[0], indexes[1])

dataframe = create_column_nom(dataframe, indexes[2], indexes[3])

save_output(dataframe, output_file)
