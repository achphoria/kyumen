# Generator template email Supabase Auth bertema Kyuka Ramen.
# Jalankan: python supabase/email-templates/build.py  -> menulis *.html di folder ini.
# Tempel isi tiap file ke Supabase Dashboard -> Authentication -> Emails (Templates).
from pathlib import Path

LOGO = 'https://achphoria.github.io/kyumen/email-logo.png'
NAVY = '#1C2F5A'
NAVY_SOFT = '#2E4A7D'
RED = '#E5483B'
CREAM = '#F4EBDD'
PAPER = '#FFFBF5'
INK = '#22324F'
MUTED = '#6B7A92'
FONT = "'Nunito','Segoe UI',Helvetica,Arial,sans-serif"
HEAD = "'Fredoka','Trebuchet MS',Arial,sans-serif"


def page(title, preheader, kanji, kana, heading, intro, button, steps, footnote, extra=''):
    steps_html = ''.join(
        f'''<tr>
          <td width="34" valign="top" style="padding:0 0 10px;">
            <div style="width:24px;height:24px;line-height:24px;border-radius:12px;background:{NAVY};color:#ffffff;font-family:{HEAD};font-size:13px;font-weight:600;text-align:center;">{i}</div>
          </td>
          <td valign="top" style="padding:2px 0 10px;font-family:{FONT};font-size:14px;line-height:21px;color:{INK};">{s}</td>
        </tr>'''
        for i, s in enumerate(steps, 1)
    )
    return f'''<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>{title}</title>
  </head>
  <body style="margin:0;padding:0;background:{CREAM};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{CREAM}" style="background:{CREAM};">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
            <!-- kepala navy: logo + noren -->
            <tr>
              <td align="center" bgcolor="{NAVY}" style="background:{NAVY};border-radius:22px 22px 0 0;padding:30px 24px 22px;">
                <img src="{LOGO}" width="96" height="96" alt="Kyuka Ramen" style="display:block;border:0;border-radius:22px;" />
                <div style="font-family:{HEAD};font-size:13px;letter-spacing:4px;color:#9CC8FF;padding-top:14px;">{kana}</div>
              </td>
            </tr>
            <tr>
              <td bgcolor="{NAVY}" style="background:{NAVY};font-size:0;line-height:0;padding:0 26px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="33%" height="18" bgcolor="{RED}" style="background:{RED};border-radius:0 0 10px 10px;">&nbsp;</td>
                    <td width="2%">&nbsp;</td>
                    <td width="30%" height="18" bgcolor="{RED}" style="background:{RED};border-radius:0 0 10px 10px;">&nbsp;</td>
                    <td width="2%">&nbsp;</td>
                    <td width="33%" height="18" bgcolor="{RED}" style="background:{RED};border-radius:0 0 10px 10px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- isi -->
            <tr>
              <td bgcolor="{PAPER}" style="background:{PAPER};padding:30px 32px 6px;border-left:1px solid #E6D6BC;border-right:1px solid #E6D6BC;">
                <div style="font-family:{HEAD};font-size:30px;line-height:34px;color:{RED};font-weight:600;">{kanji}</div>
                <h1 style="margin:6px 0 0;font-family:{HEAD};font-size:24px;line-height:31px;color:{INK};font-weight:600;">{heading}</h1>
                <p style="margin:12px 0 0;font-family:{FONT};font-size:15px;line-height:23px;color:{INK};">{intro}</p>
              </td>
            </tr>
            <tr>
              <td align="center" bgcolor="{PAPER}" style="background:{PAPER};padding:24px 32px 8px;border-left:1px solid #E6D6BC;border-right:1px solid #E6D6BC;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="{RED}" style="background:{RED};border-radius:999px;box-shadow:0 6px 0 #B3362B;">
                      <a href="{{{{ .ConfirmationURL }}}}" target="_blank" style="display:inline-block;padding:15px 38px;font-family:{HEAD};font-size:17px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">{button} &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            {extra}
            <tr>
              <td bgcolor="{PAPER}" style="background:{PAPER};padding:22px 32px 6px;border-left:1px solid #E6D6BC;border-right:1px solid #E6D6BC;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px dashed #D9C7A6;border-radius:16px;">
                  <tr>
                    <td style="padding:16px 18px 6px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{steps_html}</table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="{PAPER}" style="background:{PAPER};padding:18px 32px 28px;border-left:1px solid #E6D6BC;border-right:1px solid #E6D6BC;border-bottom:1px solid #E6D6BC;border-radius:0 0 22px 22px;">
                <p style="margin:0;font-family:{FONT};font-size:12.5px;line-height:19px;color:{MUTED};">Tombol tidak bisa diklik? Salin tautan ini ke browser:<br />
                  <a href="{{{{ .ConfirmationURL }}}}" target="_blank" style="color:{NAVY_SOFT};word-break:break-all;">{{{{ .ConfirmationURL }}}}</a>
                </p>
              </td>
            </tr>
            <!-- kaki -->
            <tr>
              <td align="center" style="padding:22px 20px 0;font-family:{FONT};font-size:12px;line-height:19px;color:{MUTED};">
                <div style="font-family:{HEAD};font-size:14px;color:{INK};letter-spacing:1px;">🐉 KYUKA RAMEN VIRTUAL 🍜</div>
                <div style="padding-top:2px;">キュウカ ラーメン バーチャル 「仮想店舗」</div>
                <div style="padding-top:10px;">{footnote}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
'''


EMAIL_BOX = f'''<tr>
              <td align="center" bgcolor="{PAPER}" style="background:{PAPER};padding:6px 32px 0;border-left:1px solid #E6D6BC;border-right:1px solid #E6D6BC;font-family:{FONT};font-size:13px;color:{MUTED};">
                Akun: <b style="color:{INK};">{{{{ .Email }}}}</b>
              </td>
            </tr>'''

TEMPLATES = {
    'confirm-signup.html': dict(
        title='Konfirmasi akun Kyuka Ramen',
        preheader='Satu klik lagi untuk bergabung ke kedai Kyuka Ramen Virtual.',
        kanji='いらっしゃいませ！',
        kana='WELCOME · ようこそ',
        heading='Selamat datang di kedai! 🍜',
        intro='Akun Kyuka Ramen Virtual untuk <b>{{ .Email }}</b> hampir siap. Klik tombol di bawah untuk mengonfirmasi email kamu, lalu Ryu dan para kru naga siap menyambutmu.',
        button='Konfirmasi email',
        steps=[
            'Masuk dengan email &amp; password kamu.',
            'Kode undangan dipakai otomatis, divisimu langsung aktif.',
            'Buat avatar, pilih joget favorit, lalu sapa rekan di dermaga.',
        ],
        footnote='Kamu menerima email ini karena ada pendaftaran Kyuka Ramen Virtual dengan alamat ini. Kalau bukan kamu, abaikan saja.',
    ),
    'reset-password.html': dict(
        title='Atur ulang password Kyuka Ramen',
        preheader='Permintaan atur ulang password akun Kyuka Ramen Virtual kamu.',
        kanji='パスワード',
        kana='RESET PASSWORD',
        heading='Lupa password? Tenang 🐉',
        intro='Ada permintaan untuk mengatur ulang password akun Kyuka Ramen Virtual. Klik tombol di bawah untuk membuat password baru.',
        button='Buat password baru',
        steps=[
            'Tautan ini hanya bisa dipakai sekali dan segera kedaluwarsa.',
            'Pilih password minimal 6 karakter yang belum pernah kamu pakai.',
            'Tidak meminta reset? Abaikan email ini, password lama tetap aman.',
        ],
        footnote='Demi keamanan, tim Kyuka Ramen tidak akan pernah menanyakan password kamu.',
        extra=EMAIL_BOX,
    ),
    'magic-link.html': dict(
        title='Tautan masuk Kyuka Ramen',
        preheader='Tautan masuk sekali pakai ke Kyuka Ramen Virtual.',
        kanji='おかえり！',
        kana='MAGIC LINK',
        heading='Masuk tanpa password ✨',
        intro='Klik tombol di bawah untuk langsung masuk ke kedai Kyuka Ramen Virtual.',
        button='Masuk ke kedai',
        steps=[
            'Tautan hanya berlaku sekali dan untuk waktu singkat.',
            'Buka di perangkat yang sama dengan tempat kamu meminta tautan.',
            'Tidak meminta tautan ini? Abaikan saja.',
        ],
        footnote='Sesi berakhir otomatis setiap pukul 00:00 WIB.',
        extra=EMAIL_BOX,
    ),
    'change-email.html': dict(
        title='Konfirmasi email baru Kyuka Ramen',
        preheader='Konfirmasi perubahan alamat email akun Kyuka Ramen Virtual.',
        kanji='メール変更',
        kana='CHANGE EMAIL',
        heading='Konfirmasi email baru 📮',
        intro='Kamu meminta mengganti email akun dari <b>{{ .Email }}</b> ke <b>{{ .NewEmail }}</b>. Klik tombol di bawah untuk mengonfirmasi.',
        button='Konfirmasi perubahan',
        steps=[
            'Setelah dikonfirmasi, masuk dengan alamat email yang baru.',
            'Profil, divisi, dan avatar kamu tetap sama.',
            'Tidak meminta perubahan ini? Segera hubungi owner kedai.',
        ],
        footnote='Kamu menerima email ini karena ada permintaan ganti email di Kyuka Ramen Virtual.',
    ),
    'invite-user.html': dict(
        title='Undangan ke Kyuka Ramen',
        preheader='Kamu diundang bergabung ke Kyuka Ramen Virtual.',
        kanji='ご招待',
        kana='INVITATION',
        heading='Kamu diundang ke kedai! 🏮',
        intro='Kamu diundang bergabung ke Kyuka Ramen Virtual, kantor virtual tempat staff bekerja bersama Ryu dan 18 agent naga. Klik tombol di bawah untuk menerima undangan.',
        button='Terima undangan',
        steps=[
            'Buat password untuk akun kamu.',
            'Masukkan kode undangan dari owner atau kepala divisi.',
            'Kenalan dengan agent di divisimu di Ruang Kerja.',
        ],
        footnote='Kamu menerima email ini karena seseorang mengundang alamat ini ke Kyuka Ramen Virtual.',
        extra=EMAIL_BOX,
    ),
}

# Template gabungan untuk project Supabase ACHPHORIA (dipakai bersama ERP):
# pendaftaran dari Kyumen (emailRedirectTo di src/sim/auth.js) tampil bertema Kyuka Ramen,
# selain itu tampil seperti template bawaan Supabase. Ganti isi ELSE_* dengan template ERP
# kalau ERP memakai template sendiri.
KYUMEN_REDIRECT = 'https://achphoria.github.io/kyumen/#/login'
ELSE_CONFIRM = '''<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
'''


def shared(kyumen_html, fallback):
    return '{{ if eq .RedirectTo "' + KYUMEN_REDIRECT + '" }}\n' + kyumen_html + '{{ else }}\n' + fallback + '{{ end }}\n'


if __name__ == '__main__':
    here = Path(__file__).parent
    for name, t in TEMPLATES.items():
        (here / name).write_text(page(**t), encoding='utf-8')
        print('ditulis', name)
    (here / 'achphoria-confirm-signup.html').write_text(shared(page(**TEMPLATES['confirm-signup.html']), ELSE_CONFIRM), encoding='utf-8')
    print('ditulis achphoria-confirm-signup.html')
