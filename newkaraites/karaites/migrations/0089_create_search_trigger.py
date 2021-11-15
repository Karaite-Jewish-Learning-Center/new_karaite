import django.contrib.postgres.indexes
import django.contrib.postgres.search
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0088_auto_20211108_2008'),
    ]

    migration = '''
           CREATE TRIGGER content_search_update BEFORE INSERT OR UPDATE
           ON Karaites_FullTextSearch FOR EACH ROW EXECUTE PROCEDURE 
           tsvector_update_trigger(text_en_search, 'pg_catalog.english', text_en);

           -- Force triggers to run and populate the text_search column.
           UPDATE Karaites_FullTextSearch set ID = ID;
       '''

    reverse_migration = '''
           DROP TRIGGER content_search_update ON FullTextSearch;
       '''

    operations = [
        migrations.RunSQL(migration, reverse_migration)
    ]