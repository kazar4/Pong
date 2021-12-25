from util import *

currPinList = random_sample(10000, 10000, 99999)

# Game PIN | ID_1 | ID_2 | 

# Insert row for 1 player creating lobby
# Update row for 2nd player connected

# Get full row data!

# PIN exist?
# Create Pin (based on ones in the current list)
    # Try a hashing map that doesnt repeat for like 1 million rooms
# Delete database entries

def generatePin():
    if len(currPinList) == 0:
        currPinList = random_sample(10000, 10000, 99999)
        # TODO: DELETE ANY OLD PINS NOT IN USE
        print("Ran out of PINs had to create more!")

    pin = currPinList[0]
    currPinList = currPinList[1:]

    return pin
