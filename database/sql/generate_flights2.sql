-- DROP PROCEDURE IF EXISTS generate_flights;

-- DELIMITER $$

-- CREATE PROCEDURE generate_flights(IN total INT)
-- BEGIN

--     DECLARE i INT DEFAULT 1;
--     DECLARE dep_id INT;
--     DECLARE arr_id INT;
--     DECLARE airline_id INT;
--     DECLARE airline_code VARCHAR(10);
--     DECLARE dep_time DATETIME;
--     DECLARE arr_time DATETIME;
--     DECLARE ticket DECIMAL(10,2);

--     WHILE i <= total DO

--         -- Select random airline
--         SELECT id, code
--         INTO airline_id, airline_code
--         FROM airlines
--         ORDER BY RAND()
--         LIMIT 1;

--         -- Select random departure airport
--         SELECT id
--         INTO dep_id
--         FROM airports
--         ORDER BY RAND()
--         LIMIT 1;

--         -- Select random arrival airport different from departure
--         SELECT id
--         INTO arr_id
--         FROM airports
--         WHERE id <> dep_id
--         ORDER BY RAND()
--         LIMIT 1;

--         -- Random departure time
--         SET dep_time = NOW() + INTERVAL FLOOR(RAND() * 300) HOUR;

--         -- Random flight duration between 1 and 12 hours
--         SET arr_time = dep_time + INTERVAL FLOOR(RAND() * 12 + 1) HOUR;

--         -- Random ticket price between 100 and 899
--         SET ticket = FLOOR(RAND() * 800 + 100);

--         INSERT INTO flights (
--             airline_id,
--             departure_airport_id,
--             arrival_airport_id,
--             flight_number,
--             departure_time,
--             arrival_time,
--             ticket_cost
--         )
--         VALUES (
--             airline_id,
--             dep_id,
--             arr_id,

--             -- GUARANTEED UNIQUE FLIGHT NUMBER
--             CONCAT(
--                 airline_code,
--                 LPAD(i, 4, '0')
--             ),

--             dep_time,
--             arr_time,
--             ticket
--         );

--         SET i = i + 1;

--     END WHILE;

-- END$$

-- DELIMITER ;


CREATE OR REPLACE PROCEDURE generate_flights(total INT)
LANGUAGE plpgsql
AS $$
DECLARE
    i INT := 1;
    v_dep_id INT;
    v_arr_id INT;
    v_airline_id INT;
    v_airline_code VARCHAR(10);
    v_dep_time TIMESTAMP;
    v_arr_time TIMESTAMP;
    v_ticket DECIMAL(10,2);
    v_flight_status VARCHAR(20);
    v_bucket INT;
    v_rand INT;
BEGIN
    WHILE i <= total LOOP

        SELECT id, code INTO v_airline_id, v_airline_code FROM airlines ORDER BY random() LIMIT 1;
        SELECT id INTO v_dep_id FROM airports ORDER BY random() LIMIT 1;
        SELECT id INTO v_arr_id FROM airports WHERE id <> v_dep_id ORDER BY random() LIMIT 1;

        v_ticket := floor(random() * 800 + 100)::numeric;
        v_bucket := floor(random() * 100);
        v_rand := floor(random() * 100);

        -- 1. Vuelos Futuros Programados (40%) -> De +2 horas hasta +30 DÍAS
        IF v_bucket < 40 THEN
            v_dep_time := NOW() + (floor(random() * 720 + 2) || ' hours')::interval;
            v_flight_status := 'SCHEDULED';

        -- 2. Vuelos en Puerta / Próximos (20%) -> Entre -15 min y +45 min (En vivo)
        ELSIF v_bucket < 60 THEN
            v_dep_time := NOW() + (floor(random() * 60 - 15) || ' minutes')::interval;
            IF v_rand < 30 THEN
                v_flight_status := 'DELAYED';
            ELSE
                v_flight_status := 'BOARDING';
            END IF;

        -- 3. Vuelos en el aire (15%) -> Despegaron hace entre 15 min y 6 horas
        ELSIF v_bucket < 75 THEN
            v_dep_time := NOW() - (floor(random() * 345 + 15) || ' minutes')::interval;
            v_flight_status := 'IN_AIR';

        -- 4. Vuelos que ya llegaron (20%) -> Histórico desde -12 horas hasta -15 DÍAS
        ELSIF v_bucket < 95 THEN
            v_dep_time := NOW() - (floor(random() * 348 + 12) || ' hours')::interval;
            v_flight_status := 'LANDED';

        -- 5. Cancelados (5%) -> Distribuidos entre los últimos 3 días y los próximos 3 días
        ELSE
            v_dep_time := NOW() + (floor(random() * 144 - 72) || ' hours')::interval;
            v_flight_status := 'CANCELLED';
        END IF;

        -- Duración del vuelo (entre 1 y 8 horas)
        v_arr_time := v_dep_time + (floor(random() * 7 + 1) || ' hours')::interval;

        INSERT INTO flights (
            airline_id, departure_airport_id, arrival_airport_id, 
            flight_number, departure_time, arrival_time, ticket_cost, status
        )
        VALUES (
            v_airline_id, v_dep_id, v_arr_id, 
            CONCAT(v_airline_code, LPAD(i::text, 4, '0')), 
            v_dep_time, v_arr_time, v_ticket, v_flight_status
        );

        i := i + 1;
    END LOOP;
END;
$$;

