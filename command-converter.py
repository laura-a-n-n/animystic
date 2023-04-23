import sys
import json

def diagnose(command_list):
    print("Attempting to diagnose command list...")
    print(command_list)
    for i in range(len(command_list) - 1):
        is_keyword = command_list[i] <= 3
        is_next_keyword = command_list[i+1] <= 3
        is_argument = command_list[i] > 3 
        is_next_argument = command_list[i+1] > 3 
        if (is_keyword and is_next_keyword) or (is_argument and is_next_argument):
            print(f"I think I found the problem! Check index {i} and {i+1}: {command_list[i]}, {command_list[i+1]}")
            return
    print(f"Hmm, I couldn't find the problem, but there are an odd number of elements. Length: {len(command_list)}")

def commands_to_wave(command_list, insert_commands=True):
  zarb = []
  squambo = []
  last_zarb_state = command_list[0]

  if len(command_list) % 2 == 1:
    print("\nGarbage command!")
    diagnose(command_list)
    return [], []
  
  for i in range(0, len(command_list), 2):
    is_squambo = command_list[i] == 3
    zarb_state = last_zarb_state
    if is_squambo:
      if insert_commands:
         squambo += [2]
      squambo += [command_list[i+1]]

      # set up next command
      squambo += [1]
      squambo += [0]
      continue
    else:
      zarb_state = command_list[i]
      if zarb_state == 1:
        if len(squambo) == 0:
           squambo = [1, 0]
        squambo[-1] += command_list[i+1]
    if zarb_state != last_zarb_state or len(zarb) == 0:
        zarb += [zarb_state]
        zarb += [command_list[i+1]]
    else:
      zarb[-1] += command_list[i+1]
    last_zarb_state = zarb_state

  if squambo[0] == 0 and squambo[1] == 0: squambo = squambo[2:]

  return zarb, squambo

def int_to_filename(n):
    return f"{n+1:0>3}.wav"

if __name__ == "__main__":
    filename = sys.argv[1]
    out_path = sys.argv[2]
    file = open(filename, "r")
    contents = file.read()

    # trim string and convert to list
    DELAY = 1
    TALK = 2
    SQUAMBO = 3
    data_string = contents.split(" = {")[1].split("};")[0]
    data_string = data_string.replace("{", "[").replace("}", "]")
    data_string = "".join(data_string.split())
    data = eval(data_string)

    print(f"Number of commands found: {len(data)}")
    print("Converting...")

    dict = dict(zarbalatrax = {}, squambo = {})
    num_success = 0
    
    for id, command_list in enumerate(data):
        zarb, squambo = commands_to_wave(command_list)
        key = int_to_filename(id)
        dict["zarbalatrax"][key] = zarb
        dict["squambo"][key] = squambo
        if len(zarb) == 0 and len(squambo) == 0:
            print(f"Error converting command for {key}")
        else:
            num_success += 1
            print(f"\rWrote {num_success} commands without fail!", end="")

    data = open(f"{out_path}/data.json", "w+")
    data.write(json.dumps(dict))
    data.close()

    print("\nData written.")