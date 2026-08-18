-- DROP PROCEDURE IF EXISTS generate_flights;

-- DELIMITER $$

-- CREATE PROCEDURE generate_flights(IN flight_count INT)
-- BEGIN
--     DECLARE i INT DEFAULT 0;
--     DECLARE max_airports INT;
--     DECLARE max_airlines INT;

--     SELECT COUNT(*) INTO max_airports FROM airports;
--     SELECT COUNT(*) INTO max_airlines FROM airlines;

--     WHILE i < flight_count DO

--         INSERT INTO flights (
--             airline_id,
--             departure_airport_id,
--             arrival_airport_id,
--             flight_number,
--             departure_time,
--             arrival_time,
--             ticket_cost
--         )
--         SELECT
--             FLOOR(1 + RAND() * max_airlines),
--             @dep := FLOOR(1 + RAND() * max_airports),
--             @arr := FLOOR(1 + RAND() * max_airports),
--             CONCAT(
--                 (SELECT code FROM airlines WHERE id = FLOOR(1 + RAND() * max_airlines)),
--                 LPAD(FLOOR(1 + RAND() * 9999), 4, '0')
--             ),
--             NOW() + INTERVAL FLOOR(RAND() * 240) MINUTE,
--             NOW() + INTERVAL FLOOR(120 + RAND() * 600) MINUTE,
--             ROUND(100 + RAND() * 900, 2);

--         SET i = i + 1;

--     END WHILE;

-- END$$

-- DELIMITER ;


DROP PROCEDURE IF EXISTS generate_flights;
DELIMITER $$

CREATE PROCEDURE generate_flights(IN total INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE dep_id INT;
    DECLARE arr_id INT;
    DECLARE airline_id INT;
    DECLARE dep_time DATETIME;
    DECLARE arr_time DATETIME;
    DECLARE ticket DECIMAL(10,2);

    WHILE i <= total DO
        
        -- airline
        SELECT id INTO airline_id 
        FROM airlines 
        ORDER BY RAND() LIMIT 1;

        -- departure airport
        SELECT id INTO dep_id 
        FROM airports 
        ORDER BY RAND() LIMIT 1;

        -- arrival airport (different)
        SELECT id INTO arr_id 
        FROM airports 
        WHERE id <> dep_id
        ORDER BY RAND() LIMIT 1;

        SET dep_time = NOW() + INTERVAL FLOOR(RAND()*300) HOUR;
        SET arr_time = dep_time + INTERVAL FLOOR(RAND()*12+1) HOUR;
        SET ticket = FLOOR(RAND()*800+100);

        INSERT INTO flights(
            airline_id,
            departure_airport_id,
            arrival_airport_id,
            flight_number,
            departure_time,
            arrival_time,
            ticket_cost
        )
        VALUES(
            airline_id,
            dep_id,
            arr_id,
            CONCAT(
                (SELECT code FROM airlines WHERE id = airline_id LIMIT 1), 
                FLOOR(RAND()*9000+1000)
            ),
            dep_time,
            arr_time,
            ticket
        );

        SET i = i + 1;
    END WHILE;

END$$
DELIMITER ;