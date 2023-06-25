import csv
import os

def convert_csv_to_abc(csv_file):
    csv_dir = os.path.dirname(csv_file)  # Get the directory path of the CSV file

    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        header = next(reader)  # Skip the header row if present

        for row in reader:
            tune_id = row[0]  # Assuming the tune ID is in column A
            tune_name = row[2]  # Assuming the tune name is in column C
            username = row[8]  # Assuming the username is in column I
            setting_id = row[1]  # Assuming the setting ID is in column B
            tune_type = row[3]  # Assuming the tune type is in column D
            meter = row[4]  # Assuming the meter is in column E
            mode = row[5]  # Assuming the mode is in column F
            abc_data = row[6]  # Assuming the .abc data is in column G

            # Create a unique file name for each .abc file
            file_name = f"{tune_name}_{row[1]}.abc"

            # Construct the output file path
            output_file_path = os.path.join(csv_dir, file_name)

            # Create the directory if it doesn't exist
            os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

            # Write the .abc data to a new file
            with open(output_file_path, 'w') as abc_file:
                abc_file.write(f"X: 1\n")
                abc_file.write(f"T: {tune_name}\n")
                abc_file.write(f"Z: {username}\n")
                abc_file.write(f"S: https://thesession.org/tunes/{tune_id}#setting{setting_id}\n")
                abc_file.write(f"R: {tune_type}\n")
                abc_file.write(f"M: {meter}\n")
                abc_file.write(f"K: {mode}\n")
                abc_file.write(abc_data)

            print(f"Created file: {output_file_path}")

# Provide the path to your CSV file
csv_file_path = "/Users/robertripley/code_projects/celtic-crossroads/tuneABCs/tunes.csv"

# Call the function to convert the CSV to .abc files
convert_csv_to_abc(csv_file_path)
