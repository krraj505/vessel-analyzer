-- Table for physical port limits (e.g., Paradip vs. Haldia)
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    port_name VARCHAR(100) NOT NULL,
    max_draft DECIMAL(5,2) NOT NULL, 
    max_loa DECIMAL(6,2) NOT NULL,    
    max_beam DECIMAL(5,2) NOT NULL   
);

-- Table for vessel directories (e.g., Supramax, Panamax)
CREATE TABLE vessels (
    id SERIAL PRIMARY KEY,
    vessel_name VARCHAR(100) NOT NULL,
    vessel_class VARCHAR(50) NOT NULL, 
    draft DECIMAL(5,2) NOT NULL,
    loa DECIMAL(6,2) NOT NULL,
    beam DECIMAL(5,2) NOT NULL,
    cargo_capacity INT NOT NULL
);

-- Insert sample East Coast ports
INSERT INTO ports (port_name, max_draft, max_loa, max_beam) VALUES
('Haldia', 8.0, 230.0, 33.0),
('Paradip', 14.5, 260.0, 40.0);

-- Insert sample vessels to test your logic later
INSERT INTO vessels (vessel_name, vessel_class, draft, loa, beam, cargo_capacity) VALUES
('MV Ocean Star', 'Handysize', 7.0, 150.0, 25.0, 35000),  -- Fits everywhere
('MV Steel Titan', 'Panamax', 12.0, 225.0, 32.0, 75000),  -- Fits Paradip, fails Haldia (draft too deep)
('MV Behemoth', 'Capesize', 18.0, 290.0, 45.0, 150000);   -- Fails both (too big)