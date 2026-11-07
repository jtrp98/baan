WITH expected(table_name) AS (
    VALUES ('SchoolBotLessonMissionAttempt'), ('SchoolBotLessonMissionAccessEvent')
), catalog_tables AS (
    SELECT expected.table_name, relation.oid, relation.relkind
    FROM expected
    LEFT JOIN pg_catalog.pg_namespace AS namespace ON namespace.nspname = 'public'
    LEFT JOIN pg_catalog.pg_class AS relation
        ON relation.relnamespace = namespace.oid
        AND relation.relname = expected.table_name
)
SELECT current_database() AS database_name,
    statement_timestamp() AS captured_at,
    tables.table_name,
    tables.relkind AS relation_kind,
    obj_description(tables.oid, 'pg_class') AS table_description,
    COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
            'name', column_info.attname,
            'type', format_type(column_info.atttypid, column_info.atttypmod),
            'not_null', column_info.attnotnull,
            'identity', NULLIF(column_info.attidentity::text, ''),
            'default', pg_get_expr(column_default.adbin, column_default.adrelid),
            'description', col_description(tables.oid, column_info.attnum)
        ) ORDER BY column_info.attnum)
        FROM pg_catalog.pg_attribute AS column_info
        LEFT JOIN pg_catalog.pg_attrdef AS column_default
            ON column_default.adrelid = column_info.attrelid
            AND column_default.adnum = column_info.attnum
        WHERE column_info.attrelid = tables.oid
          AND column_info.attnum > 0
          AND NOT column_info.attisdropped
    ), '[]'::jsonb) AS columns,
    COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
            'name', table_constraint.conname,
            'definition', pg_get_constraintdef(table_constraint.oid)
        ) ORDER BY table_constraint.conname)
        FROM pg_catalog.pg_constraint AS table_constraint
        WHERE table_constraint.conrelid = tables.oid
    ), '[]'::jsonb) AS constraints,
    COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
            'primary', table_index.indisprimary,
            'definition', pg_get_indexdef(table_index.indexrelid)
        ) ORDER BY table_index.indexrelid)
        FROM pg_catalog.pg_index AS table_index
        WHERE table_index.indrelid = tables.oid
    ), '[]'::jsonb) AS indexes
FROM catalog_tables AS tables
ORDER BY tables.table_name;
