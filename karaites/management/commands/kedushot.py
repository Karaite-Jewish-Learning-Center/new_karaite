from django.core.management.base import BaseCommand
from openpyxl import load_workbook
from ...models import (MenuItems,
                       Kedushot)


from pathlib import Path


class Command(BaseCommand):
    help = 'Fill in Kedushot and items database'

    def handle(self, *args, **options):
        """Import Kedushot and Piyyutim La-Parashiyyot"""

        open_file = Path('karaites/management/commands/kedushot.xlsx')
        wb = load_workbook(open_file)
        ws = wb.active
        kedushot_order = 1000
        last_kedushot = None
        menu_order = 1000
        poems = 'Poems for the Weekly Torah Portion'
        # open Index Format sheet
        index_format_ws = wb['Index Format']

        # skip first row , read column A,B and C until first empty cell
        for row in index_format_ws.iter_rows(min_row=2, max_col=3, max_row=index_format_ws.max_row):
            if row[1].value is None:
                break
            if row[1].value == poems:
                continue

            self.stdout.write(f"Processing row: {row[0].value}, {row[1].value}, {row[2].value}")

            if row[0].value in ['Expand/Collapse', '#']:
                last_kedushot, created = Kedushot.objects.get_or_create(
                    menu_title_left=row[1].value,
                    menu_title_right=row[2].value,
                    belongs_to='Poems for the Weekly Sabbath' if row[0].value == '#' else poems,
                    defaults={'order': kedushot_order}
                )
                self.stdout.write(f"Created Kedushot: {last_kedushot.menu_title_left}")
                kedushot_order += 1000
            else:
                if last_kedushot is None:
                    self.stdout.write(self.style.ERROR(
                        f"Error: Trying to add menu item without a parent Kedushot. Row: {row[1].value}"
                    ))
                    continue

                menu_item, created = MenuItems.objects.get_or_create(
                    menu_item=row[1].value,
                    complement=row[2].value,
                    defaults={'order': menu_order}
                )
                self.stdout.write(f"Created MenuItem: {menu_item.menu_item}")

                last_kedushot.menu_items.add(menu_item)
                menu_order += 1000

        self.stdout.write(self.style.SUCCESS('Successfully imported Kedushot data'))
