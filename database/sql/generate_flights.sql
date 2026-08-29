DROP PROCEDURE IF EXISTS generate_flights;

DELIMITER $$

CREATE PROCEDURE generate_flights(IN total INT)
BEGIN

    DECLARE i INT DEFAULT 1;
    DECLARE dep_id INT;
    DECLARE arr_id INT;
    DECLARE airline_id INT;
    DECLARE airline_code VARCHAR(10);
    DECLARE dep_time DATETIME;
    DECLARE arr_time DATETIME;
    DECLARE ticket DECIMAL(10,2);

    WHILE i <= total DO

        -- Select random airline
        SELECT id, code
        INTO airline_id, airline_code
        FROM airlines
        ORDER BY RAND()
        LIMIT 1;

        -- Select random departure airport
        SELECT id
        INTO dep_id
        FROM airports
        ORDER BY RAND()
        LIMIT 1;

        -- Select random arrival airport different from departure
        SELECT id
        INTO arr_id
        FROM airports
        WHERE id <> dep_id
        ORDER BY RAND()
        LIMIT 1;

        -- Random departure time
        SET dep_time = NOW() + INTERVAL FLOOR(RAND() * 300) HOUR;

        -- Random flight duration between 1 and 12 hours
        SET arr_time = dep_time + INTERVAL FLOOR(RAND() * 12 + 1) HOUR;

        -- Random ticket price between 100 and 899
        SET ticket = FLOOR(RAND() * 800 + 100);

        INSERT INTO flights (
            airline_id,
            departure_airport_id,
            arrival_airport_id,
            flight_number,
            departure_time,
            arrival_time,
            ticket_cost
        )
        VALUES (
            airline_id,
            dep_id,
            arr_id,

            -- GUARANTEED UNIQUE FLIGHT NUMBER
            CONCAT(
                airline_code,
                LPAD(i, 4, '0')
            ),

            dep_time,
            arr_time,
            ticket
        );

        SET i = i + 1;

    END WHILE;

END$$

DELIMITER ;