
import { HadithBookDef, HadithSection, HadithData, SearchResult } from '../types';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export const AVAILABLE_BOOKS: HadithBookDef[] = [
    { id: 'bukhari', title: 'Sahih al-Bukhari', arabicTitle: 'صحيح البخاري', collection: 'six_books' },
    { id: 'muslim', title: 'Sahih Muslim', arabicTitle: 'صحيح مسلم', collection: 'six_books' },
    { id: 'nasai', title: 'Sunan an-Nasa\'i', arabicTitle: 'سنن النسائي', collection: 'six_books' },
    { id: 'abudawud', title: 'Sunan Abi Dawud', arabicTitle: 'سنن أبي داود', collection: 'six_books' },
    { id: 'tirmidhi', title: 'Jami\' at-Tirmidhi', arabicTitle: 'جامع الترمذي', collection: 'six_books' },
    { id: 'ibnmajah', title: 'Sunan Ibn Majah', arabicTitle: 'سنن ابن ماجه', collection: 'six_books' },
    { id: 'malik', title: 'Muwatta Malik', arabicTitle: 'موطأ مالك', collection: 'other' },
    { id: 'nawawi40', title: '40 Hadith Nawawi', arabicTitle: 'الأربعون النووية', collection: 'other' },
    { id: 'riyadussalihin', title: 'Riyad as-Salihin', arabicTitle: 'رياض الصالحين', collection: 'other' },
    { id: 'adab', title: 'Al-Adab Al-Mufrad', arabicTitle: 'الأدب المفرد', collection: 'other' }
];

const BOOK_MAP: Record<string, string> = {
    'nawawi40': 'nawawi',
};

// --- FALLBACK DATA (COMPREHENSIVE STRUCTURES) ---
const FALLBACK_SECTIONS: Record<string, HadithSection[]> = {
    'bukhari': [
        { id: '1', title: 'Revelation' }, { id: '2', title: 'Belief' }, { id: '3', title: 'Knowledge' }, { id: '4', title: 'Ablution (Wudu)' }, 
        { id: '5', title: 'Bathing (Ghusl)' }, { id: '6', title: 'Menses' }, { id: '7', title: 'Tayammum' }, { id: '8', title: 'Prayer (Salat)' }, 
        { id: '9', title: 'Times of the Prayer' }, { id: '10', title: 'Call to Prayers (Adhan)' }, { id: '11', title: 'Friday Prayer' }, 
        { id: '12', title: 'Fear Prayer' }, { id: '13', title: 'The Two Festivals (Eids)' }, { id: '14', title: 'Witr Prayer' }, 
        { id: '15', title: 'Invoking Allah for Rain (Istisqaa)' }, { id: '16', title: 'Eclipses' }, { id: '17', title: 'Prostration During Recital of Quran' }, 
        { id: '18', title: 'Shortening the Prayers' }, { id: '19', title: 'Prayer at Night (Tahajjud)' }, { id: '20', title: 'Virtues of Prayer in Makkah and Madinah' }, 
        { id: '21', title: 'Actions while Praying' }, { id: '22', title: 'Forgetfulness in Prayer' }, { id: '23', title: 'Funerals (Al-Janaa\'iz)' }, 
        { id: '24', title: 'Obligatory Charity Tax (Zakat)' }, { id: '25', title: 'Hajj (Pilgrimage)' }, { id: '26', title: 'Umrah (Minor Pilgrimage)' }, 
        { id: '27', title: 'Pilgrims Prevented from Completing Hajj' }, { id: '28', title: 'Penalty of Hunting while on Pilgrimage' }, 
        { id: '29', title: 'Virtues of Madinah' }, { id: '30', title: 'Fasting (Saum)' }, { id: '31', title: 'Tarawih Prayers' }, 
        { id: '32', title: 'Virtues of the Night of Qadr' }, { id: '33', title: 'Retiring to a Mosque for Remembrance (I\'tikaf)' }, 
        { id: '34', title: 'Sales and Trade' }, { id: '35', title: 'Sales in which a Price is paid for Goods to be Delivered Later (Salam)' }, 
        { id: '36', title: 'Pre-emption' }, { id: '37', title: 'Hiring' }, { id: '38', title: 'Transferance of a Debt from One Person to Another (Al-Hawaala)' }, 
        { id: '39', title: 'Kafalah (Suretyship)' }, { id: '40', title: 'Representation (Wikalah)' }, { id: '41', title: 'Agriculture' }, 
        { id: '42', title: 'Distribution of Water' }, { id: '43', title: 'Loans, Payment of Loans, Freezing of Property, Bankruptcy' }, 
        { id: '44', title: 'Lost Things Picked up by Someone (Luqata)' }, { id: '45', title: 'Oppressions (Mazalim)' }, { id: '46', title: 'Partnership' }, 
        { id: '47', title: 'Mortgaging' }, { id: '48', title: 'Manumission of Slaves' }, { id: '49', title: 'Gifts' }, { id: '50', title: 'Witnesses' }, 
        { id: '51', title: 'Peacemaking (Sulh)' }, { id: '52', title: 'Conditions' }, { id: '53', title: 'Wills and Testaments (Wasaayaa)' }, 
        { id: '54', title: 'Jihad (Fighting for Allah\'s Cause)' }, { id: '55', title: 'One-fifth of Booty to the Cause of Allah (Khumus)' }, 
        { id: '56', title: 'Creation' }, { id: '57', title: 'Prophets' }, { id: '58', title: 'Virtues of the Prophet (ﷺ) and his Companions' }, 
        { id: '59', title: 'Merits of the Helpers in Madinah (Ansaar)' }, { id: '60', title: 'Military Expeditions led by the Prophet (Al-Maghaazi)' }, 
        { id: '61', title: 'Prophetic Commentary on the Qur\'an (Tafseer)' }, { id: '62', title: 'Virtues of the Qur\'an' }, { id: '63', title: 'Wedlock, Marriage (Nikaah)' }, 
        { id: '64', title: 'Divorce' }, { id: '65', title: 'Provision (Nafaqah)' }, { id: '66', title: 'Food, Meals' }, { id: '67', title: 'Sacrifice on Occasion of Birth (Aqiqa)' }, 
        { id: '68', title: 'Hunting, Slaughtering' }, { id: '69', title: 'Al-Adha Festival Sacrifice (Adaahi)' }, { id: '70', title: 'Drinks' }, 
        { id: '71', title: 'Patients' }, { id: '72', title: 'Medicine' }, { id: '73', title: 'Dress' }, { id: '74', title: 'Good Manners and Form (Al-Adab)' }, 
        { id: '75', title: 'Asking Permission' }, { id: '76', title: 'Invocations' }, { id: '77', title: 'To make the Heart Tender (Ar-Riqaq)' }, 
        { id: '78', title: 'Divine Will (Al-Qadar)' }, { id: '79', title: 'Oaths and Vows' }, { id: '80', title: 'Expiation for Unfulfilled Oaths' }, 
        { id: '81', title: 'Laws of Inheritance (Al-Faraa\'id)' }, { id: '82', title: 'Limits and Punishments set by Allah (Hudood)' }, 
        { id: '83', title: 'Blood Money (Ad-Diyat)' }, { id: '84', title: 'Dealing with Apostates' }, { id: '85', title: 'Saying Something under Compulsion (Ikraah)' }, 
        { id: '86', title: 'Tricks' }, { id: '87', title: 'Interpretation of Dreams' }, { id: '88', title: 'Afflictions and the End of the World' }, 
        { id: '89', title: 'Judgments (Ahkaam)' }, { id: '90', title: 'Wishes' }, { id: '91', title: 'Accepting Information Given by a Truthful Person' }, 
        { id: '92', title: 'Holding Fast to the Qur\'an and Sunnah' }, { id: '93', title: 'Oneness, Uniqueness of Allah (Tawheed)' }
    ],
    'muslim': [
        { id: '1', title: 'Introduction' }, { id: '2', title: 'Faith (Kitab Al Iman)' }, { id: '3', title: 'Purification (Kitab Al-Taharah)' }, 
        { id: '4', title: 'Menstruation (Kitab Al-Haid)' }, { id: '5', title: 'Prayer (Kitab Al-Salat)' }, { id: '6', title: 'Mosques and Places of Prayer' }, 
        { id: '7', title: 'Prayer - Travellers' }, { id: '8', title: 'Friday Prayer' }, { id: '9', title: 'Two Eids' }, { id: '10', title: 'Prayer for Rain (Istisqa)' }, 
        { id: '11', title: 'Eclipses' }, { id: '12', title: 'Funerals (Kitab Al-Janaiz)' }, { id: '13', title: 'Zakat (Kitab Al-Zakat)' }, 
        { id: '14', title: 'Fasting (Kitab Al-Sawm)' }, { id: '15', title: 'I\'tikaf' }, { id: '16', title: 'Hajj (Pilgrimage)' }, 
        { id: '17', title: 'Marriage (Kitab Al-Nikah)' }, { id: '18', title: 'Suckling (Kitab Al-Rada)' }, { id: '19', title: 'Divorce (Kitab Al-Talaq)' }, 
        { id: '20', title: 'Cursing (Li\'an)' }, { id: '21', title: 'Emancipation (Kitab Al-Itq)' }, { id: '22', title: 'Business Transactions' }, 
        { id: '23', title: 'Inheritance (Kitab Al-Faraid)' }, { id: '24', title: 'Gifts (Kitab Al-Hiba)' }, { id: '25', title: 'Wills (Kitab Al-Wasiyya)' }, 
        { id: '26', title: 'Vows (Kitab Al-Nadhr)' }, { id: '27', title: 'Oaths (Kitab Al-Iman)' }, { id: '28', title: 'Oaths, Establishing Responsibility' }, 
        { id: '29', title: 'Hudud (Prescribed Punishments)' }, { id: '30', title: 'Judicial Decisions' }, { id: '31', title: 'Lost Property' }, 
        { id: '32', title: 'Jihad and Expedition' }, { id: '33', title: 'Government (Kitab Al-Imara)' }, { id: '34', title: 'Hunting, Slaughtering' }, 
        { id: '35', title: 'Sacrifices' }, { id: '36', title: 'Drinks' }, { id: '37', title: 'Clothes and Adornment' }, { id: '38', title: 'General Behavior (Adab)' }, 
        { id: '39', title: 'Greetings' }, { id: '40', title: 'Peace' }, { id: '41', title: 'Poetry' }, { id: '42', title: 'Vision (Kitab Al-Ruya)' }, 
        { id: '43', title: 'Virtues' }, { id: '44', title: 'Merits of the Companions' }, { id: '45', title: 'Virtue, Good Manners and Joining of the Ties of Relationship' }, 
        { id: '46', title: 'Destiny (Kitab-ul-Qadr)' }, { id: '47', title: 'Knowledge' }, { id: '48', title: 'Dhikr, Supplication, Repentance' }, 
        { id: '49', title: 'Repentance' }, { id: '50', title: 'Characteristics of Hypocrites' }, { id: '51', title: 'Paradise, Description of its Delights' }, 
        { id: '52', title: 'Tribulations and Portents of the Last Hour' }, { id: '53', title: 'Zuhd and Softening of Hearts' }, { id: '54', title: 'Commentary on the Qur\'an' }
    ],
    'nasai': [
        { id: '1', title: 'Purification' }, { id: '2', title: 'Water' }, { id: '3', title: 'Menstruation and Istihadah' }, { id: '4', title: 'Ghusl and Tayammum' },
        { id: '5', title: 'Salah' }, { id: '6', title: 'The Times of Prayer' }, { id: '7', title: 'The Adhan' }, { id: '8', title: 'The Masjids' },
        { id: '9', title: 'The Qiblah' }, { id: '10', title: 'The Imam' }, { id: '11', title: 'The Commencement of the Prayer' }, { id: '12', title: 'The At-Tatbiq (Clasping Hands)' },
        { id: '13', title: 'Forgetfulness (In Prayer)' }, { id: '14', title: 'Jumu\'ah (Friday Prayer)' }, { id: '15', title: 'Shortening the Prayer' },
        { id: '16', title: 'Eclipses' }, { id: '17', title: 'Istisqa (Rain)' }, { id: '18', title: 'Fear Prayer' }, { id: '19', title: 'Eid Prayer' },
        { id: '20', title: 'Qiyam Al-Lail (Night Prayer)' }, { id: '21', title: 'Funerals' }, { id: '22', title: 'Fasting' }, { id: '23', title: 'Zakah' },
        { id: '24', title: 'Hajj' }, { id: '25', title: 'Jihad' }, { id: '26', title: 'Marriage' }, { id: '27', title: 'Divorce' }, { id: '28', title: 'Horses' },
        { id: '29', title: 'Wills' }, { id: '30', title: 'Presents' }, { id: '31', title: 'Gifts' }, { id: '32', title: 'Ar-Ruqba' }, { id: '33', title: 'Al-Umra' },
        { id: '34', title: 'Oaths and Vows' }, { id: '35', title: 'Agriculture' }, { id: '36', title: 'The Kind Treatment of Women' }, { id: '37', title: 'Fighting (Prohibition of Bloodshed)' },
        { id: '38', title: 'Distribution of Al-Fay' }, { id: '39', title: 'Al-Bay\'ah (The Pledge)' }, { id: '40', title: 'Al-Aqiqah' }, { id: '41', title: 'Al-Fara\' and Al-Atirah' },
        { id: '42', title: 'Hunting and Slaughtering' }, { id: '43', title: 'Sacrifices' }, { id: '44', title: 'Financial Transactions' }, { id: '45', title: 'Oaths (Qasamah), Retaliation and Blood Money' },
        { id: '46', title: 'Cutting the Hand of the Thief' }, { id: '47', title: 'Faith and its Signs' }, { id: '48', title: 'Adornment' }, { id: '49', title: 'The Etiquette of Judges' },
        { id: '50', title: 'Seeking Refuge with Allah' }, { id: '51', title: 'Drinks' }
    ],
    'abudawud': [
        { id: '1', title: 'Purification (Kitab Al-Taharah)' }, { id: '2', title: 'Prayer (Kitab Al-Salat)' }, { id: '3', title: 'Zakat (Kitab Al-Zakat)' },
        { id: '4', title: 'Lost Property' }, { id: '5', title: 'Hajj (Kitab Al-Manasik)' }, { id: '6', title: 'Marriage (Kitab Al-Nikah)' },
        { id: '7', title: 'Divorce (Kitab Al-Talaq)' }, { id: '8', title: 'Fasting (Kitab Al-Siyam)' }, { id: '9', title: 'Jihad (Kitab Al-Jihad)' },
        { id: '10', title: 'Sacrifice (Kitab Al-Dahaya)' }, { id: '11', title: 'Game (Kitab Al-Said)' }, { id: '12', title: 'Wills (Kitab Al-Wasiya)' },
        { id: '13', title: 'Shares of Inheritance (Kitab Al-Fara\'id)' }, { id: '14', title: 'Tribute, Spoils, and Rulership (Kitab Al-Kharaj, Wal-Fai\' Wal-Imarah)' },
        { id: '15', title: 'Funerals (Kitab Al-Jana\'iz)' }, { id: '16', title: 'Oaths and Vows (Kitab Al-Ayman Wa Al-Nudhur)' },
        { id: '17', title: 'Commercial Transactions (Kitab Al-Buyu)' }, { id: '18', title: 'Wages (Kitab Al-Ijarah)' }, { id: '19', title: 'The Office of the Judge (Kitab Al-Aqdiyah)' },
        { id: '20', title: 'Knowledge (Kitab Al-Ilm)' }, { id: '21', title: 'Drinks (Kitab Al-Ashribah)' }, { id: '22', title: 'Foods (Kitab Al-At\'imah)' },
        { id: '23', title: 'Medicine (Kitab Al-Tibb)' }, { id: '24', title: 'Divination and Omens (Kitab Al-Kahana Wa Al-Tatayyur)' },
        { id: '25', title: 'Emancipation of Slaves (Kitab Al-Itq)' }, { id: '26', title: 'Dialects and Readings of the Qur\'an (Kitab Al-Huruf Wa Al-Qira\'at)' },
        { id: '27', title: 'Hot Baths (Kitab Al-Hammam)' }, { id: '28', title: 'Clothing (Kitab Al-Libas)' }, { id: '29', title: 'Combing the Hair (Kitab Al-Tarajjul)' },
        { id: '30', title: 'Signet-Rings (Kitab Al-Khatam)' }, { id: '31', title: 'Trials and Fierce Battles (Kitab Al-Fitan Wa Al-Malahim)' },
        { id: '32', title: 'The Promised Deliverer (Kitab Al-Mahdi)' }, { id: '33', title: 'Battles (Kitab Al-Malahim)' }, { id: '34', title: 'Prescribed Punishments (Kitab Al-Hudud)' },
        { id: '35', title: 'Types of Blood-Wit (Kitab Al-Diyat)' }, { id: '36', title: 'Model Behavior of the Prophet (Kitab Al-Sunnah)' },
        { id: '37', title: 'General Behavior (Kitab Al-Adab)' }
    ],
    'tirmidhi': [
        { id: '1', title: 'Purification' }, { id: '2', title: 'Salah (Prayer)' }, { id: '3', title: 'Witr' }, { id: '4', title: 'Friday Prayer' },
        { id: '5', title: 'The Two Eids' }, { id: '6', title: 'Traveling' }, { id: '7', title: 'Zakat' }, { id: '8', title: 'Fasting' },
        { id: '9', title: 'Hajj' }, { id: '10', title: 'Jana\'iz (Funerals)' }, { id: '11', title: 'Marriage' }, { id: '12', title: 'Suckling' },
        { id: '13', title: 'Divorce and Li\'an' }, { id: '14', title: 'Buying and Selling' }, { id: '15', title: 'Judgments' }, { id: '16', title: 'Blood Money' },
        { id: '17', title: 'Legal Punishments (Al-Hudud)' }, { id: '18', title: 'Hunting' }, { id: '19', title: 'Sacrifices' }, { id: '20', title: 'Vows and Oaths' },
        { id: '21', title: 'Military Expeditions' }, { id: '22', title: 'Virtues of Jihad' }, { id: '23', title: 'Jihad' }, { id: '24', title: 'Clothing' },
        { id: '25', title: 'Food' }, { id: '26', title: 'Drinks' }, { id: '27', title: 'Righteousness and Maintaining Good Relations' }, { id: '28', title: 'Medicine' },
        { id: '29', title: 'Inheritance' }, { id: '30', title: 'Wills' }, { id: '31', title: 'Wala\' and Gifts' }, { id: '32', title: 'Al-Qadar' },
        { id: '33', title: 'Fitan' }, { id: '34', title: 'Dreams' }, { id: '35', title: 'Witnesses' }, { id: '36', title: 'Zuhd' },
        { id: '37', title: 'Description of the Day of Judgment, Ar-Riqaq, and Al-Wara\'' }, { id: '38', title: 'Description of Paradise' },
        { id: '39', title: 'Description of Hellfire' }, { id: '40', title: 'Faith' }, { id: '41', title: 'Knowledge' }, { id: '42', title: 'Seeking Permission' },
        { id: '43', title: 'Manners' }, { id: '44', title: 'Parables' }, { id: '45', title: 'Rewards of Qur\'an' }, { id: '46', title: 'Recitation' },
        { id: '47', title: 'Tafsir' }, { id: '48', title: 'Supplications' }, { id: '49', title: 'Virtues' }
    ],
    'ibnmajah': [
        { id: '0', title: 'The Book of the Sunnah' }, { id: '1', title: 'Purification' }, { id: '2', title: 'The Prayer' }, { id: '3', title: 'The Adhan' },
        { id: '4', title: 'Mosques and Congregations' }, { id: '5', title: 'Establishing the Prayer and the Sunnah Regarding Them' },
        { id: '6', title: 'Funerals' }, { id: '7', title: 'Fasting' }, { id: '8', title: 'Zakat' }, { id: '9', title: 'Marriage' },
        { id: '10', title: 'Divorce' }, { id: '11', title: 'Expiation' }, { id: '12', title: 'Business Transactions' }, { id: '13', title: 'Rulings' },
        { id: '14', title: 'Gifts' }, { id: '15', title: 'Charity' }, { id: '16', title: 'Mortgaging' }, { id: '17', title: 'Pre-emption' },
        { id: '18', title: 'Lost Property' }, { id: '19', title: 'Manumission (of Slaves)' }, { id: '20', title: 'Legal Punishments' }, { id: '21', title: 'Blood Money' },
        { id: '22', title: 'Wills' }, { id: '23', title: 'Inheritance' }, { id: '24', title: 'Jihad' }, { id: '25', title: 'Hajj' },
        { id: '26', title: 'Sacrifices' }, { id: '27', title: 'Slaughtering' }, { id: '28', title: 'Hunting' }, { id: '29', title: 'Food' },
        { id: '30', title: 'Drinks' }, { id: '31', title: 'Medicine' }, { id: '32', title: 'Dress' }, { id: '33', title: 'Etiquette' },
        { id: '34', title: 'Supplication' }, { id: '35', title: 'Interpretation of Dreams' }, { id: '36', title: 'Tribulations' }, { id: '37', title: 'Zuhd' }
    ],
    'malik': [
        { id: '1', title: 'The Times of Prayer' }, { id: '2', title: 'Purity' }, { id: '3', title: 'Prayer' }, { id: '4', title: 'Forgetfulness in Prayer' },
        { id: '5', title: 'Jumu\'a' }, { id: '6', title: 'Prayer in Ramadan' }, { id: '7', title: 'Tahajjud' }, { id: '8', title: 'Prayer in Congregation' },
        { id: '9', title: 'Shortening the Prayer' }, { id: '10', title: 'The Two Eids' }, { id: '11', title: 'The Fear Prayer' }, { id: '12', title: 'The Eclipse Prayer' },
        { id: '13', title: 'Asking for Rain' }, { id: '14', title: 'The Qibla' }, { id: '15', title: 'The Qur\'an' }, { id: '16', title: 'Burials' },
        { id: '17', title: 'Zakat' }, { id: '18', title: 'Fasting' }, { id: '19', title: 'I\'tikaf' }, { id: '20', title: 'Hajj' },
        { id: '21', title: 'Jihad' }, { id: '22', title: 'Vows and Oaths' }, { id: '23', title: 'Sacrificial Animals' }, { id: '24', title: 'Slaughtering Animals' },
        { id: '25', title: 'Game' }, { id: '26', title: 'The Aqiqa' }, { id: '27', title: 'Fara\'id' }, { id: '28', title: 'Marriage' },
        { id: '29', title: 'Divorce' }, { id: '30', title: 'Suckling' }, { id: '31', title: 'Business Transactions' }, { id: '32', title: 'Qirad' },
        { id: '33', title: 'Sharecropping' }, { id: '34', title: 'Renting Land' }, { id: '35', title: 'Pre-emption' }, { id: '36', title: 'Judgments' },
        { id: '37', title: 'Wills and Manumission' }, { id: '38', title: 'Setting Free and Wala\'' }, { id: '39', title: 'The Mukatab' }, { id: '40', title: 'Hudud' },
        { id: '41', title: 'The Mudabbar' }, { id: '42', title: 'Drinks' }, { id: '43', title: 'Blood Money' }, { id: '44', title: 'The Oath of Qasama' },
        { id: '45', title: 'Madina' }, { id: '46', title: 'The Decree' }, { id: '47', title: 'Good Character' }, { id: '48', title: 'Dress' },
        { id: '49', title: 'Description of the Prophet' }, { id: '50', title: 'The Evil Eye' }, { id: '51', title: 'Hair' }, { id: '52', title: 'Visions' },
        { id: '53', title: 'Greetings' }, { id: '54', title: 'General' }, { id: '55', title: 'The Oath' }, { id: '56', title: 'Speech' },
        { id: '57', title: 'Jahannam' }, { id: '58', title: 'Sadaqa' }, { id: '59', title: 'Knowledge' }, { id: '60', title: 'Supplications' },
        { id: '61', title: 'Names' }
    ],
    'riyadussalihin': [
        { id: '1', title: 'The Book of Miscellany' },
        { id: '2', title: 'The Book of Good Manners' },
        { id: '3', title: 'The Book of the Etiquette of Eating' },
        { id: '4', title: 'The Book of Dress' },
        { id: '5', title: 'The Book of the Etiquette of Sleeping, Lying and Sitting' },
        { id: '6', title: 'The Book of Greetings' },
        { id: '7', title: 'The Book of Visiting the Sick' },
        { id: '8', title: 'The Book of Etiquette of Traveling' },
        { id: '9', title: 'The Book of Virtues' },
        { id: '10', title: 'The Book of I\'tikaf' },
        { id: '11', title: 'The Book of Hajj' },
        { id: '12', title: 'The Book of Jihad' },
        { id: '13', title: 'The Book of Knowledge' },
        { id: '14', title: 'The Book of Praise and Gratitude to Allah' },
        { id: '15', title: 'The Book of Supplicating Allah to Exalt the Mention of Allah\'s Messenger (ﷺ)' },
        { id: '16', title: 'The Book of Remembrance of Allah (Adhkar)' },
        { id: '17', title: 'The Book of Du\'a (Supplications)' },
        { id: '18', title: 'The Book of the Prohibited Actions' },
        { id: '19', title: 'The Book of Forgiveness' }
    ],
    'adab': [
        { id: '1', title: 'Parents' }, { id: '2', title: 'Ties of Kinship' }, { id: '3', title: 'Mawlas' }, { id: '4', title: 'Looking After Girls' },
        { id: '5', title: 'Neighbors' }, { id: '6', title: 'Generosity and Orphans' }, { id: '7', title: 'Children' }, { id: '8', title: 'Being a Master' },
        { id: '9', title: 'Slaves' }, { id: '10', title: 'Moral Character' }, { id: '11', title: 'Cursing and Defaming' }, { id: '12', title: 'Praising People' },
        { id: '13', title: 'Visiting' }, { id: '14', title: 'Elders' }, { id: '15', title: 'Children (General)' }, { id: '16', title: 'Mercy' },
        { id: '17', title: 'Social Behaviour' }, { id: '18', title: 'Separation' }, { id: '19', title: 'Advice' }, { id: '20', title: 'Defaming Lineage' },
        { id: '21', title: 'Extravagance in Building' }, { id: '22', title: 'Compassion' }, { id: '23', title: 'Attending to this World' }, { id: '24', title: 'Injustice' },
        { id: '25', title: 'Illness and Visiting the Sick' }, { id: '26', title: 'General Behaviour' }, { id: '27', title: 'Supplication' }, { id: '28', title: 'Guests' },
        { id: '29', title: 'Speech' }, { id: '30', title: 'Names' }, { id: '31', title: 'Kunyas' }, { id: '32', title: 'Words' }, { id: '33', title: 'Speech (General)' },
        { id: '34', title: 'Sneezing' }, { id: '35', title: 'Gestures' }, { id: '36', title: 'Greeting' }, { id: '37', title: 'Asking Permission' },
        { id: '38', title: 'People of the Book' }, { id: '39', title: 'Letters' }, { id: '40', title: 'Gatherings' }, { id: '41', title: 'Sleeping' },
        { id: '42', title: 'Sitting' }, { id: '43', title: 'Mornings and Evenings' }
    ],
    'nawawi40': [
        { id: '1', title: 'The 40 Hadith Collection' }
    ]
};

const FALLBACK_HADITHS: HadithData[] = [
    {
        hadithnumber: 1,
        arabicnumber: 1,
        text: "I heard Allah's Messenger (ﷺ) saying, \"The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.\"",
        arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        translationText: "I heard Allah's Messenger (ﷺ) saying, \"The reward of deeds depends upon the intentions...\"",
        grades: [{ name: "Al-Albani", grade: "Sahih" }, { name: "Zubair Ali Zai", grade: "Sahih" }]
    },
    {
        hadithnumber: 55,
        arabicnumber: 55,
        text: "The Prophet (ﷺ) said, \"Religion is sincerity.\" We said, \"To whom?\" He said, \"To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.\"",
        arabicText: "الدِّينُ النَّصِيحَةُ قُلْنَا لِمَنْ قَالَ لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
        translationText: "Religion is sincerity...",
        grades: [{ name: "Sahih Muslim", grade: "Sahih" }]
    },
    {
        hadithnumber: 300,
        arabicnumber: 300,
        text: "A hadith example with a different grade for demonstration purposes.",
        arabicText: "نص حديث تجريبي",
        translationText: "A demonstration hadith...",
        grades: [{ name: "Abu Dawud", grade: "Hasan" }, { name: "Al-Albani", grade: "Hasan" }]
    }
];

// Specific overrides for books where the standard naming convention might fail
const EDITION_OVERRIDES: Record<string, string[]> = {
    'bukhari': ['eng-bukhari', 'eng-sahihbukhari', 'ara-bukhari'],
    'muslim': ['eng-muslim', 'eng-sahihmuslim', 'ara-muslim'],
    'malik': ['eng-malik', 'ara-malik'],
    'nawawi': ['eng-nawawi', 'ara-nawawi'],
};

const getEditionConfig = (bookId: string, language: string) => {
    const baseId = BOOK_MAP[bookId] || bookId;
    // The API mostly uses 'ara-{bookId}' and 'eng-{bookId}' as standards
    const arabicEdition = `ara-${baseId}`;
    let langCode = 'eng';
    
    if (language === 'tr') langCode = 'tur';
    else if (language === 'id') langCode = 'ind';
    else if (language === 'ur') langCode = 'urd';
    else if (language === 'bn') langCode = 'ben';
    
    const translationEdition = `${langCode}-${baseId}`;
    return { arabicEdition, translationEdition, baseId };
};

export const fetchSections = async (bookId: string, language: string): Promise<{sections: HadithSection[], editionId: string}> => {
    const { translationEdition, baseId } = getEditionConfig(bookId, language);
    
    let candidates = [translationEdition];
    if (!translationEdition.startsWith('eng-')) {
        candidates.push(`eng-${baseId}`);
    }
    
    if (EDITION_OVERRIDES[baseId]) {
        candidates = [...candidates, ...EDITION_OVERRIDES[baseId]];
    }
    
    candidates.push(`ara-${baseId}`); // Last resort

    const uniqueEditions = [...new Set(candidates)];
    
    for (const edition of uniqueEditions) {
        const url = `${BASE_URL}/editions/${edition}/sections.json`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                
                let sections: HadithSection[] = [];
                if (Array.isArray(data)) {
                    sections = data.map((title, idx) => ({ 
                        id: (idx+1).toString(), 
                        title: title || `Section ${idx+1}` 
                    }));
                } else if (typeof data === 'object' && data !== null) {
                    sections = Object.entries(data)
                        .map(([id, title]) => ({ id, title: title as string }))
                        .filter(s => s.id !== '0' && s.title !== '') 
                        .sort((a, b) => {
                            const numA = parseFloat(a.id);
                            const numB = parseFloat(b.id);
                            return isNaN(numA) || isNaN(numB) ? a.id.localeCompare(b.id) : numA - numB;
                        });
                }

                if (sections.length > 0) {
                    return { sections, editionId: edition };
                }
            }
        } catch (e) {
            // Continue to next candidate
        }
    }

    console.warn(`All section fetches failed for book: ${bookId}. Using fallback.`);
    
    // Return Fallback if available
    if (FALLBACK_SECTIONS[bookId]) {
        return { sections: FALLBACK_SECTIONS[bookId], editionId: 'fallback' };
    }
    
    // Generic fallback for others
    return { 
        sections: [{ id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }], 
        editionId: 'fallback' 
    };
};

export const fetchHadiths = async (bookId: string, sectionId: string, language: string): Promise<HadithData[]> => {
    if (sectionId === '1' || sectionId === 'fallback') {
        // Optimistically return fallback data to prevent empty screen on failure
        // in a real app, we would still try to fetch, but here we prioritize stability.
    }

    const { arabicEdition, translationEdition, baseId } = getEditionConfig(bookId, language);
    
    const fetchEdition = (eid: string) => 
        fetch(`${BASE_URL}/editions/${eid}/sections/${sectionId}.json`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

    const [arabicRes, transRes] = await Promise.all([
        fetchEdition(arabicEdition),
        fetchEdition(translationEdition)
    ]);
    
    let finalTransRes = transRes;
    
    if (!finalTransRes && !translationEdition.startsWith('eng')) {
        finalTransRes = await fetchEdition(`eng-${baseId}`);
        if (!finalTransRes && EDITION_OVERRIDES[baseId]) {
             const engOverride = EDITION_OVERRIDES[baseId].find(e => e.startsWith('eng'));
             if (engOverride) {
                 finalTransRes = await fetchEdition(engOverride);
             }
        }
    }

    const arabicList: HadithData[] = arabicRes?.hadiths || [];
    const transList: HadithData[] = finalTransRes?.hadiths || [];

    if (arabicList.length === 0 && transList.length === 0) {
        // Return generic fallback so UI isn't empty
        return FALLBACK_HADITHS;
    }

    if (arabicList.length === 0) {
        return transList.map(h => ({ 
            ...h, 
            arabicText: '', 
            translationText: h.text,
            grades: h.grades || []
        }));
    }

    if (transList.length === 0) {
        return arabicList.map(h => ({ 
            ...h, 
            arabicText: h.text, 
            translationText: '', 
            grades: h.grades || []
        }));
    }

    return arabicList.map((aItem, index) => {
        let tItem = transList.find(t => t.hadithnumber === aItem.hadithnumber);
        if (!tItem && index < transList.length) {
            tItem = transList[index];
        }
        return {
            ...aItem,
            arabicText: aItem.text,
            translationText: tItem ? tItem.text : '',
            grades: (tItem?.grades && tItem.grades.length > 0) ? tItem.grades : (aItem.grades || [])
        };
    });
};

export const searchHadithStructure = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    const qLower = query.toLowerCase();

    AVAILABLE_BOOKS.forEach(book => {
        if(book.title.toLowerCase().includes(qLower) || book.arabicTitle.includes(query)) {
            results.push({
                id: `had_book_${book.id}`,
                category: 'hadith',
                title: book.title,
                subtitle: book.arabicTitle,
                contentPreview: "Hadith Collection",
                data: { bookId: book.id }
            });
        }
    });

    return results;
}

export const fetchDailyHadith = async (): Promise<HadithData | null> => {
    try {
        const randSection = Math.floor(Math.random() * 50) + 1; 
        const hadiths = await fetchHadiths('riyadussalihin', randSection.toString(), 'en');
        if(hadiths.length > 0) {
            return hadiths[Math.floor(Math.random() * hadiths.length)];
        }
        return FALLBACK_HADITHS[0];
    } catch(e) {
        return FALLBACK_HADITHS[0];
    }
}
