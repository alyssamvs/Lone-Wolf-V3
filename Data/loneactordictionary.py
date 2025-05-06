import pandas as pd
import json

# Load the CSV file to a DataFrame

df = pd.read_csv('./LoneActorDictionary.csv')


lone_actor_dict = df.set_index('Name').T.to_dict()

# Wrap the dictionary under a top-level key 'actors'
grouped_dict = {'actors': lone_actor_dict}

# Save the dictionary to a JSON file
with open('lone_actor_dict2.json', 'w') as json_file:
    json.dump(grouped_dict, json_file, indent=4)

print("Dictionary has been saved to lone_actor_dict2.json")
