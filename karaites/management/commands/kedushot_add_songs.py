from django.core.management.base import BaseCommand
from ...models import Songs


class Command(BaseCommand):
    help = 'Fill Database details from sheets'

    def add_songs(self):
        files = [
            "10_-_Piyut_-_Miketz.mp3",
            "11_-_Piyut_-_Vayigash.mp3",
            "12_-_Piyut_-_Vayechi.mp3",
            "13_-_Piyut_-_Shemot.mp3",
            "14_-_Piyut_-_Vaera.mp3",
            "15_-_Piyut_-_Bo_El_Paro.mp3",
            "16_-_Piyut_-_Beshalach.mp3",
            "17_-_Piyut_-_Yitro.mp3",
            "18_-_Piyut_-_Mishpatim.mp3",
            "19_-_Piyut_-_Teruma.mp3",
            "1_-_Piyut_-_Bereshit.mp3",
            "20_-_Piyut_-_Tetsave.mp3",
            "21_-_Piyut_-_Ki_Tisa.mp3",
            "22_-_Piyut_-_Vayakhel.mp3",
            "23_-_Piyut_-_Pekude.mp3",
            "24_-_Piyut_-_VaYikra.mp3",
            "25_-_Piyut_-_Tsav.mp3",
            "26_-_Piyut_-_Shemini.mp3",
            "27_-_Piyut_-_Tazria.mp3",
            "28_-_Piyut_-_Metzora.mp3",
            "29_-_Piyut_-_Achare_Mot.mp3",
            "2_-_Piyut_-_Noach.mp3",
            "30_-_Piyut_-_Kedoshim.mp3",
            "31_-_Piyut_-_Emor.mp3",
            "32_-_Piyut_-_Behar_Sinay.mp3",
            "33_-_Piyut_-_Bechukotay.mp3",
            "34_-_Piyut_-_Bemidbar_Sinay.mp3",
            "35_-_Piyut_-_Naso.mp3",
            "36_-_Piyut_-_Beha_alotecha.mp3",
            "37_-_Piyut_-_Shelach_Lecha.mp3",
            "38_-_Piyut_-_Korach.mp3",
            "39_-_Piyut_-_Chukat.mp3",
            "3_-_Piyut_-_Lech_Lecha.mp3",
            "40_-_Piyut_-_Balak.mp3",
            "41_-_Piyut_-_Pinechas.mp3",
            "42_-_Piyut_-_Matot.mp3",
            "43_-_Piyut_-_Masey.mp3",
            "44_-_Piyut_-_Devarim.mp3",
            "45-_Piyut_-_Vaetchanan.mp3",
            "46-_Piyut_-_Ekev.mp3",
            "47-_Piyut_-_Re_e.mp3",
            "48-_Piyut_-_Shofetim.mp3",
            "49_-_Piyut_-_Ki_Tetze.mp3",
            "4_-_Piyut_-_Vayera.mp3",
            "50_-_Piyut_-_Ki_Tavo.mp3",
            "51_-_Piyut_-_Nitzavim.mp3",
            "52_-_Piyut_-_Vayelech1.mp3",
            "52_-_Piyut_-_Vayelech2.mp3",
            "53_-_Piyut_-_Haazinu.mp3",
            "54_-_Piyut_-_Vezot_Haberacha.mp3",
            "5_-_Piyut_-_Chaye_Sarah.mp3",
            "6_-_Piyut_-_Toledot_Yitzchak.mp3",
            "7_-_Piyut_-_Vayetze_A.mp3",
            "7_-_Piyut_-_Vayetze_B.mp3",
            "8_-_Piyut_-_Vayishlach.mp3",
            "9_-_Piyut_-_Vayeshev.mp3"
        ]
        # add all songs to the database source directory
        for file in files:
            song_title = file.split('-')[2].replace('.mp3', '').replace('_', '', 1).replace('_', ' ')
            song_file = 'songs/' + file
            song, created = Songs.objects.get_or_create(
                song_title=song_title,
                song_file=song_file
            )
            print(f"Processing {song.song_title}")
        print('End processing songs')

    def handle(self, *args, **options):
        self.add_songs()
