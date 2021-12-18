import pandas as pd
import sys
import progress_bar as pb

"""

Add a id_parent_area with the reference to the parent area. For region (no parent), default is set to 1

"""

column_input_joined = ""
column_relation_id_joined = ""
column_relation_name_joined = ""
column_relation_id_added = ""
column_relation_name_added = ""

def load_args():
    global column_input_joined
    global column_relation_id_joined
    global column_relation_name_joined
    global column_relation_id_added
    global column_relation_name_added
    args = sys.argv
    if (len(args) != 8 + 1):
        print("Usage : python reformater.py [input_name.csv] [relation_name.csv] [output_name.csv] [column_input_joined] [column_relation_id_joined] [column_relation_name_joined]  [column_relation_id_added] [column_relation_name_added]")
    input_file = args[1]
    relation_file = args[2]
    output_file = args[3]
    column_input_joined = args[4]
    column_relation_id_joined = args[5]
    column_relation_name_joined = args[6]
    column_relation_id_added = args[7]
    column_relation_name_added = args[8]

    if not(input_file.endswith('.csv')):
        print("Input file must be .csv")
        exit()
    if not(relation_file.endswith('.csv')):
        print("Relation file must be .csv")
        exit()
    if not(output_file.endswith('.csv')):
        print("Output file must be .csv")
        exit()
    return input_file, relation_file, output_file

def load_files(input_name, relation_name):
    df_input = pd.read_csv(input_name, delimiter=',', dtype=str)
    df_relation = pd.read_csv(relation_name, delimiter=';', dtype=str)
    return df_input, df_relation

def convert_file(df_input, df_relation):

    merge = pd.merge(df_input, df_relation, left_on=column_input_joined, right_on=(column_relation_id_joined), how="left")
    pb.progress(2)
    merge = merge.drop([column_relation_name_added, column_relation_name_joined], axis=1)
    pb.progress(3)
    return merge

def save_output(df, output_file):
    df.to_csv(output_file, index=False, sep=',')
    pb.progress(4)
    return

input_file, relation_file, output_file = load_args()


pb.init(5, _prefix="Add parent column \t")
pb.progress(0)
df_input, df_relation = load_files(input_file, relation_file)


df = convert_file(df_input, df_relation)

save_output(df, output_file)
pb.progress(5)
