import pandas as pd
import sys
import progress_bar as pb

"""

Subdivide all lines of the file into one line per candidate
Output file format :

id_area, name_area, candidate, votes

"""
candidate_count = 0
matching = {"DUPONT-AIGNAN" : "DP", "LE PEN" : "LP", "MACRON" : "MA", "HAMON" : "HA", "ARTHAUD" : "AR", "POUTOU" : "PO", "CHEMINADE" : "CH", "LASSALLE" : "LA", "MÉLENCHON" : "ME", "ASSELINEAU" : "AS", "FILLON" : "FI" }

def load_args():

    global candidate_count

    args = sys.argv
    input_file = args[1]
    output_file = args[2]
    candidate_count = int(args[3])
    if (len(args) != (1 + 2 + 1 + 2 + candidate_count * 3)):
        print("Usage : python reformater.py [input_file.csv] [output_file.csv] [candidate_count] [index_id_area] [index_name_area] [index_candidate 1] [index_vote 1] [index_proportion 1] ... [index_candidate 11] [index_vote 11] [index_proportion 11]")
    indexes = args[4:]
    if not(input_file.endswith('.csv')):
        print("Input file must be .csv")
        exit()
    if not(output_file.endswith('.csv')):
        print("Output file must be .csv")
        exit()
    return input_file, output_file, indexes

def load_input_file(name):
    dataframe = pd.read_csv(name, delimiter=';', low_memory=False)
    return dataframe

def generate_develloped_file(df, indexes):

    # Set develloped dataset with votes
    output = pd.DataFrame(columns=["id_area", "name_area", "candidate", "votes", "proportion"])

    def add_rows(row, index_id_area, index_name_area, index_candidate, index_votes, index_proportion, candidate_index):
        pb.progress(candidate_index * row_count + row.name)
        return pd.Series([row.iloc[index_id_area],row.iloc[index_name_area], matching[row.iloc[index_candidate]], row.iloc[index_votes], float(str(row.iloc[index_proportion]).replace(',', '.'))], index=output.columns)
        
    for i in range(candidate_count):
        df_candidate =  df.apply(lambda row : add_rows(row, int(indexes[0]), int(indexes[1]), int(indexes[3 * i + 2]), int(indexes[3 * i + 3]), int(indexes[3 * i + 4]), i), axis = 1)
        output = output.append(df_candidate, ignore_index=True)

    return output

def save_output(df, output_file):
    df.to_csv(output_file, index=False, sep=",")
    pb.progress(candidate_count * row_count)
    return

pb.init(1, _prefix="Develop data \t \t")
pb.progress(0)
input_file, output_file, indexes = load_args()

dataframe = load_input_file(input_file)

row_count = dataframe.shape[0]
pb.set_length(candidate_count * row_count)

dataframe = generate_develloped_file(dataframe, indexes)

save_output(dataframe, output_file)
