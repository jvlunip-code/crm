from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0004_customer_decisor_customer_segment'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "CREATE EXTENSION IF NOT EXISTS unaccent;",
                """
                CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
                RETURNS text LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS
                $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;
                """,
            ],
            reverse_sql=[
                "DROP FUNCTION IF EXISTS public.immutable_unaccent(text);",
            ],
        ),
    ]
