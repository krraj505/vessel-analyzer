import psycopg2
import psycopg2.extras

def filter_compatible_vessels(target_port, all_vessels):
    compatible_vessels = []
    for vessel in all_vessels:
        if (vessel['draft'] <= target_port['max_draft'] and 
            vessel['loa'] <= target_port['max_loa'] and 
            vessel['beam'] <= target_port['max_beam']):
            compatible_vessels.append(vessel)
    return compatible_vessels

def run_system():
    try:
        print("Step 1: Connecting to PostgreSQL...")
        # ⚠️ Change YOUR_PASSWORD below
        conn = psycopg2.connect(
            dbname="steelfreight_db",
            user="postgres",
            password="743959", 
            host="localhost",
            port="5432"
        )
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        print("Step 2: Looking for Haldia in the database...")
        cursor.execute("SELECT * FROM ports WHERE port_name = 'Haldia';")
        live_port = cursor.fetchone()
        
        # 🚨 This catches the error if the database is empty!
        if live_port is None:
            print("❌ ERROR: Could not find 'Haldia' in your ports table! Did you run the INSERT SQL yesterday?")
            return

        print("Step 3: Looking for ships in the database...")
        cursor.execute("SELECT * FROM vessels;")
        live_vessels = cursor.fetchall()
        
        if not live_vessels:
            print("❌ ERROR: Your vessels table is empty!")
            return

        print("Step 4: Running the constraint engine...")
        approved_ships = filter_compatible_vessels(live_port, live_vessels)
        
        print(f"\n--- Approved Ships for {live_port['port_name']} ---")
        for ship in approved_ships:
            print(f"✅ {ship['vessel_name']} (Class: {ship['vessel_class']})")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ System crashed! Exact error: {e}")

if __name__ == "__main__":
    run_system()