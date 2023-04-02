# MAPPING ROUTES, TRIPS & STOPS FOR GTFS DATA

# Trips

The trips.txt file contains a list of trips, each with:
1 - A route ID: route_id e.g. 4089
2 - A trip ID: trip_id e.g. 1364975
3 - A shape ID: shape_id e.g. 24971
4 - A direction ID: direction_id e.g. 0 or 1
5 - A trip headsign: trip_headsign e.g. MACNAB TRANSIT TERMINAL or UPPER GAGE at RYMAL

# Routes

The routes.txt file defines the set of bus routes for a specific Company, each with:
1 - A route ID: route_id e.g. 4080
2 - The name of the Company: agency_id e.g. HSR
3 - The Route Long Name: route_long_name e.g. PARKDALE
4 - The Route Short Name: route_short_name e.g. 10, 11 or CANOPEN
5 - The Route Color: route_color e.g. DA251D

Routes can branch on different trips

# Shapes

The shapes.txt file contains a set of points, each with:
1 - A common ID: shape_id
2 - A latitude: shape_pt_lat
3 - A longitude: shape_pt_lon
4 - A sequence number: shape_pt_sequence
5 - A distance travelled from the previous point: shape_dist_traveled

Each shape has a common shape_id and consists of the total sequence of straight lines joining these points.

# Stop Times

The stop_times.txt file specifies individual stop arrivals and departures for each trip. It contains:
1 - A trip ID: trip_id
2 - Arrival time at the stop: arrival_time
3 - Departure time at the stop: departure_time
4 - A single stop: stop_id
5 - A unique number for a given trip to indicate the stopping order: stop_sequence

# Stops

The stops.txt contains individual locations where vehicles pick up or drop off passengers, each with:
1 - A common ID: stop_id
2 - A latitude: stop_lat
3 - A longitude: stop_lon
4 - A name of the stop as passengers know it by: stop_name
5 - A code identifying a stop to passengers: stop_code

The stops.txt file also contains details of stations, timezomes, wheelchair access etc.

# TIMING OF EACH TRIP?

# USER EXPERIENCE

1 - Display empty map & list of the 78 available routes & their names.
2 - Select a route or Cancel back to 1
3 - Display the selected route & stops on the map & list the trips for that route, including the times (and direction?)
4 - Select a trip, Cancel back to 3 or Cancel back to 1

# DEVELOPER

Use trips database
1 - Select all route_id & group all associated trip_id, shape_id, direction_id & trip_headsign
2 - Save these to an intermediate file: all_route_id

Use all_route_id database
1 - Iterate over all trip_id, for all shape_id
2 - Select all shape_pt_lat, shape_pt_lon, shape_pt_sequence & shape_dist_traveled
3 - Compute cumulative distances...?

Alternate:
1 - Iterate over all trip_id & direction_id, for all route_id
2 - For each trip_id & direction_id:
a - If first iteration then save trip_id
b - Select all start & end shape_pt_sequence if direction_id = 0 else flip start & end shape_pt_sequence
c - If these are all the same start & end shape_pt_sequence then ignore
d - Iterate trip_id
