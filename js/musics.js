/* ============================================================
   MUHSIC — MUSICS.JS
   Banco de músicas do sistema (simulação, sem backend)
   ------------------------------------------------------------
   Estrutura de cada música:
       id          → número único global
       title       → nome da música
       artist      → nome do artista
       category    → 'playlist' | 'album' | 'genre'
       playlist    → nome da playlist (se category === 'playlist')
       album       → nome do álbum (se category === 'album')
       albumColor  → cor do header do álbum (opcional)
       genre       → nome do gênero (se category === 'genre')
       coverImage  → URL da capa
       url         → URL do áudio (.mp3)
       duration    → duração em segundos
       userIds     → array de IDs de usuários que PODEM ver a música
                     [0]     → todos veem
                     [0, 1]  → todos veem + Murilo também
                     [1]     → SÓ Murilo vê (exclusiva)
   ------------------------------------------------------------
   CONVENÇÃO:
   0 = global (todos os usuários logados veem)
   1 = Murilo N.B
   2 = Raiany
   3 = Carol
   4 = Teste
   ============================================================ */

const baseSongs = [

    /* ============================================================
       PLAYLIST: MUHMETAL  (EXCLUSIVA — só Murilo, ID 1)
       ============================================================ */

    {
        id: 9,
        title: 'Alive',
        artist: 'Seven Hours After Violet',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786582130/ab67616d0000e1a3897a1cf8eb458d9dbd5d8d6a.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786582198/Alive_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 11,
        title: 'Engine No 9',
        artist: 'Deftones',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d00001e02e0aa988082afc4ea586ab8dc.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786589196/Engine_No._9_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 12,
        title: '7 Words',
        artist: 'Deftones',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d00001e02e0aa988082afc4ea586ab8dc.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786589196/7_Words_spotdown.org.mp3',
        duration: 250,
        userIds: [1]
    },
    {
        id: 13,
        title: 'Forgotten',
        artist: 'Linkin Park',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d0000e1a3e2f039481babe23658fc719a.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786589196/Forgotten_spotdown.org.mp3',
        duration: 245,
        userIds: [1]
    },
    {
        id: 100,
        title: 'Dead Memories',
        artist: 'Slipknot',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599225/ab67616d00001e02457163bec7e8e4decf8c6375.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599307/Dead_Memories_spotdown.org.mp3',
        duration: 280,
        userIds: [1]
    },
    {
        id: 101,
        title: 'November Rain',
        artist: "Guns N' Roses",
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599219/ab67616d0000e1a32ab85e10aa698513679ff509.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599347/November_Rain_-_2022_Version_spotdown.org.mp3',
        duration: 320,
        userIds: [1]
    },
    {
        id: 200,
        title: 'Insane',
        artist: 'Korn',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0268a97b904b543920dcf8f5df.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682368/Insane_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 201,
        title: 'COME SAY SUM (ft. Fred Durst)',
        artist: 'Lauren Sanderson',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e02615a6ea451d7099d02fcaf0d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682356/COME_SAY_SUM_ft._Fred_Durst__spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 202,
        title: 'Reward the Scars',
        artist: 'Korn',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684134/ab67616d00001e02afc6ff34d042059babd16afe.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682358/Reward_the_Scars_spotdown.org.mp3',
        duration: 250,
        userIds: [1]
    },
    {
        id: 203,
        title: 'Yellowjacket (feat. Sam Carter)',
        artist: 'Spiritbox',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684137/ab67616d00001e023e234c82f96fa4ded8e5ca47.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682355/Yellowjacket_-_feat._Sam_Carter_spotdown.org.mp3',
        duration: 260,
        userIds: [1]
    },
    {
        id: 204,
        title: 'Cold',
        artist: 'Korn',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684140/ab67616d00001e0207912e5895802fee13ef17a3.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682355/Cold_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 205,
        title: 'Here to Stay',
        artist: 'Korn',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684131/ab67616d0000e1a367b097c11348179a60c0866d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682356/Here_to_Stay_spotdown.org.mp3',
        duration: 280,
        userIds: [1]
    },
    {
        id: 206,
        title: 'PRAGA',
        artist: 'Trash Poll',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684139/ab67616d00001e02904ee2ab3d0111cb81498d59.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682348/PRAGA_spotdown.org.mp3',
        duration: 200,
        userIds: [1]
    },
    {
        id: 207,
        title: 'Points of Authority',
        artist: 'Linkin Park',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d0000e1a3e2f039481babe23658fc719a.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682346/Points_of_Authority_spotdown.org.mp3',
        duration: 220,
        userIds: [1]
    },
    {
        id: 208,
        title: 'e se?',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0214cd77831599326b3782f5c2.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682334/e_se__spotdown.org.mp3',
        duration: 210,
        userIds: [1]
    },
    {
        id: 209,
        title: 'Diamond Eyes',
        artist: 'Deftones',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684131/ab67616d0000e1a305dcb69c7d4b76293c77411e.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682328/Diamond_Eyes_spotdown.org.mp3',
        duration: 250,
        userIds: [1]
    },
    {
        id: 210,
        title: 'Odisseia',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0279f5ddb4fa5e66daee7f573d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682317/Odisseia_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 211,
        title: 'Sem Controle',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0279f5ddb4fa5e66daee7f573d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682319/Sem_Controle_spotdown.org.mp3',
        duration: 220,
        userIds: [1]
    },
    {
        id: 212,
        title: 'Recomeçar',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0279f5ddb4fa5e66daee7f573d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682318/Recome%C3%A7ar_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 213,
        title: 'CANIVETE',
        artist: 'Trash Poll',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e028f19e73e067afb9f295d6247.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682313/CANIVETE_spotdown.org.mp3',
        duration: 190,
        userIds: [1]
    },
    {
        id: 214,
        title: 'SEGURO O SKATE PELO TRUCK',
        artist: 'Trash Poll',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e028f19e73e067afb9f295d6247.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682314/SEGURO_O_SKATE_PELO_TRUCK_spotdown.org.mp3',
        duration: 200,
        userIds: [1]
    },
    {
        id: 215,
        title: 'Meu Jeitinho',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0279f5ddb4fa5e66daee7f573d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682310/Meu_Jeitinho_spotdown.org.mp3',
        duration: 215,
        userIds: [1]
    },
    {
        id: 216,
        title: 'uroboros',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0214cd77831599326b3782f5c2.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682303/uroboros_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 217,
        title: 'DIE',
        artist: 'Trash Poll',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684133/ab67616d0000e1a32881e34c16af3d6824ac000d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682298/DIE_spotdown.org.mp3',
        duration: 210,
        userIds: [1]
    },
    {
        id: 218,
        title: 'Pollution',
        artist: 'Limp Bizkit',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684133/ab67616d0000e1a3946301359b8ad60772671b8f.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682293/Pollution_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 219,
        title: 'No Foco',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0279f5ddb4fa5e66daee7f573d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682286/No_Foco_spotdown.org.mp3',
        duration: 220,
        userIds: [1]
    },
    {
        id: 220,
        title: 'Refém',
        artist: 'LVCAS',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684138/ab67616d00001e0214cd77831599326b3782f5c2.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682288/ref%C3%A9m_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 221,
        title: 'Roots Bloody Roots',
        artist: 'Sepultura',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684136/ab67616d00001e020bd5e7cce9765c2ef519424e.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682283/Roots_Bloody_Roots_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 222,
        title: 'All Out Life',
        artist: 'Slipknot',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684132/ab67616d0000e1a3120ad9d866b0575b2afeeafb.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682281/All_Out_Life_spotdown.org.mp3',
        duration: 280,
        userIds: [1]
    },
    {
        id: 223,
        title: 'Eat You Alive',
        artist: 'Limp Bizkit',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684133/ab67616d0000e1a344971d48c21dbd132f2d506e.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682276/Eat_You_Alive_spotdown.org.mp3',
        duration: 260,
        userIds: [1]
    },
    {
        id: 224,
        title: 'God Is A Weapon',
        artist: 'Falling In Reverse',
        category: 'playlist',
        playlist: 'MuhMetal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a3f931e23ec87c533246a48f90.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682274/God_Is_A_Weapon_spotdown.org.mp3',
        duration: 300,
        userIds: [1]
    },

    /* ============================================================
       ÁLBUM: NEVER ENOUGH  (EXCLUSIVO — só Murilo, ID 1)
       ============================================================ */

    {
        id: 20,
        title: 'BIRDS',
        artist: 'Turnstile',
        category: 'album',
        album: 'NEVER ENOUGH',
        albumColor: '#1a3a5c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02e6b88d3e4886ae3a17621c53.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591690/BIRDS_spotdown.org.mp3',
        duration: 200,
        userIds: [1]
    },
    {
        id: 21,
        title: 'SOLE',
        artist: 'Turnstile',
        category: 'album',
        album: 'NEVER ENOUGH',
        albumColor: '#1a3a5c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02e6b88d3e4886ae3a17621c53.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591693/SOLE_spotdown.org.mp3',
        duration: 210,
        userIds: [1]
    },
    {
        id: 22,
        title: 'LOOK OUT FOR ME',
        artist: 'Turnstile',
        category: 'album',
        album: 'NEVER ENOUGH',
        albumColor: '#1a3a5c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02e6b88d3e4886ae3a17621c53.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591693/LOOK_OUT_FOR_ME_spotdown.org.mp3',
        duration: 215,
        userIds: [1]
    },
    {
        id: 23,
        title: 'SLOWDIVE',
        artist: 'Turnstile',
        category: 'album',
        album: 'NEVER ENOUGH',
        albumColor: '#1a3a5c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02e6b88d3e4886ae3a17621c53.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591698/SLOWDIVE_spotdown.org.mp3',
        duration: 225,
        userIds: [1]
    },

    /* ============================================================
       ÁLBUM: GLOW ON  (EXCLUSIVO — só Murilo, ID 1)
       ============================================================ */

    {
        id: 30,
        title: 'BLACKOUT',
        artist: 'Turnstile',
        category: 'album',
        album: 'GLOW ON',
        albumColor: '#4a2c2c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02c11ba539d58741bbd1332c92.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591699/BLACKOUT_spotdown.org.mp3',
        duration: 190,
        userIds: [1]
    },
    {
        id: 31,
        title: "DON'T PLAY",
        artist: 'Turnstile',
        category: 'album',
        album: 'GLOW ON',
        albumColor: '#4a2c2c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02c11ba539d58741bbd1332c92.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591690/DON_T_PLAY_spotdown.org.mp3',
        duration: 200,
        userIds: [1]
    },
    {
        id: 32,
        title: 'HOLIDAY',
        artist: 'Turnstile',
        category: 'album',
        album: 'GLOW ON',
        albumColor: '#4a2c2c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02c11ba539d58741bbd1332c92.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591690/HOLIDAY_spotdown.org.mp3',
        duration: 210,
        userIds: [1]
    },
    {
        id: 33,
        title: 'ENDLESS',
        artist: 'Turnstile',
        category: 'album',
        album: 'GLOW ON',
        albumColor: '#4a2c2c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02c11ba539d58741bbd1332c92.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591689/ENDLESS_spotdown.org.mp3',
        duration: 220,
        userIds: [1]
    },
    {
        id: 34,
        title: 'T.L.C (TURNSTILE LOVE CONNECTION)',
        artist: 'Turnstile',
        category: 'album',
        album: 'GLOW ON',
        albumColor: '#4a2c2c',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e02c11ba539d58741bbd1332c92.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591689/T.L.C._TURNSTILE_LOVE_CONNECTION__spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },

    /* ============================================================
       ÁLBUM: FATHER OF PEACE  (EXCLUSIVO — só Murilo, ID 1)
       ============================================================ */

    {
        id: 50,
        title: 'Persian',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597273/ab67616d0000e1a3660e04b226ffed35473f050d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597269/Persian_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    },
    {
        id: 51,
        title: 'Bluish',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597389/ab67616d00001e028c52e39a4a18cff65bd1144c.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597404/Bluish_spotdown.org.mp3',
        duration: 215,
        userIds: [1]
    },
    {
        id: 52,
        title: 'No Complaints',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597478/ab67616d00001e025237a6f215d64b7e59f7d15f.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597492/No_Complaints_spotdown.org.mp3',
        duration: 200,
        userIds: [1]
    },
    {
        id: 53,
        title: 'Business State Of Mind',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597704/ab67616d0000e1a338931b15827a59d75296bfa1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597778/Business_State_Of_Mind_spotdown.org.mp3',
        duration: 240,
        userIds: [1]
    },
    {
        id: 54,
        title: 'Escapism.',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597704/ab67616d0000e1a338931b15827a59d75296bfa1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597762/Escapism._spotdown.org.mp3',
        duration: 220,
        userIds: [1]
    },
    {
        id: 55,
        title: 'The Land Of Foreign Suns',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597704/ab67616d0000e1a338931b15827a59d75296bfa1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597738/The_Land_Of_Foreign_Suns_spotdown.org.mp3',
        duration: 250,
        userIds: [1]
    },
    {
        id: 56,
        title: 'The Year Of Madness',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597704/ab67616d0000e1a338931b15827a59d75296bfa1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597764/The_Year_Of_Madness_spotdown.org.mp3',
        duration: 235,
        userIds: [1]
    },
    {
        id: 57,
        title: 'Enemy',
        artist: 'Father Of Peace',
        category: 'album',
        album: 'Father Of Peace',
        albumColor: '#2d4a3e',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786597704/ab67616d0000e1a338931b15827a59d75296bfa1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786597759/Enemy_spotdown.org.mp3',
        duration: 260,
        userIds: [1]
    },

    /* ============================================================
       GÊNERO: INDIE  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 10,
        title: 'Loser',
        artist: 'Tame Impala',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d00001e02208500450dcd0fd294d7bd3b.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786589196/Loser_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 102,
        title: 'Overnight',
        artist: 'Richard Carter',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599220/ab67616d0000e1a3309bafcdd8f23676ae81f6bb.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599274/Overnight_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 103,
        title: 'Fumes',
        artist: 'LOSTNOTE',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599219/ab67616d0000e1a370dc32a932ebdfd037f8bd4d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599288/Fumes_spotdown.org.mp3',
        duration: 195,
        userIds: [0]
    },
    {
        id: 301,
        title: 'Hotel Room',
        artist: 'Ax and the Hatchetmen',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3f0c67e711b89f278cb9e9600.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682363/Hotel_Room_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 302,
        title: 'Self Aware',
        artist: 'Temper City',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3d6c26d2ae723f7ab553d64cc.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682364/Self_Aware_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 303,
        title: 'Go Bananas',
        artist: 'Baby Gravy',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684131/ab67616d0000e1a315f04c6e3d7c57a5a4348bca.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682345/Go_Bananas_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 304,
        title: 'Knee Socks',
        artist: 'Artic Monkeys',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684137/ab67616d00001e024ae1c4c5c45aabe565499163.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682341/Knee_Socks_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 305,
        title: 'Rock & Roll',
        artist: 'Oliver Malcolm',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684131/ab67616d0000e1a360b016869bf3f2d9024dcff6.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682300/Rock_Roll_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 306,
        title: 'End of Beginning',
        artist: 'Djo',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a3fddfffec51b4580acae727c1.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682279/End_of_Beginning_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 906,
        title: 'The Ballad of Eddie Jabuley',
        artist: 'Hotel Ugly',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684133/ab67616d0000e1a3791f14bd8b23dad1638c9d41.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682369/The_Ballad_of_Eddie_Jabuley_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: TRAP  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 61,
        title: 'Mítico Jovem',
        artist: 'Ryu The Runner',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e02f545aba01572f7bd7e42b42b.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599276/M%C3%ADtico_Jovem_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 62,
        title: 'REI TUÊ',
        artist: 'Matuê',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599221/ab67616d0000e1a343112179518345098d90d4a5.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599294/REI_TU%C3%8A_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },
    {
        id: 63,
        title: 'BACKSTAGE',
        artist: 'Matuê',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599221/ab67616d0000e1a343112179518345098d90d4a5.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599306/BACKSTAGE_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 64,
        title: 'Flow Espacial',
        artist: 'Teto, Wiu, Matuê',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599220/ab67616d0000e1a313210ec96da13fcbc4066f28.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599339/Flow_Espacial_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 65,
        title: '4Tal',
        artist: 'Matuê, Teto',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e022eb219eef2414503421a5704.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599346/4Tal_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 66,
        title: 'JAPONÊS',
        artist: 'Brandão85, Matuê',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786600799/ab67616d0000e1a30c34ec2101bd4ecf853dbf56.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599352/JAPON%C3%8AS_spotdown.org.mp3',
        duration: 205,
        userIds: [0]
    },
    {
        id: 500,
        title: 'BENÇA',
        artist: 'Brandão85',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684134/ab67616d00001e02bae9205078790642f67bfdfd.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682336/BEN%C3%87A_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1127,
        title: 'Imagina esse Cenário',
        artist: 'Matuê, Veigh',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e022eb219eef2414503421a5704.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795647/Imagina_esse_Cen%C3%A1rio_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1157,
        title: 'PARTY',
        artist: 'Alee',
        category: 'genre',
        genre: 'Trap',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e02eb021b18fcead1189954756d.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839339/PARTY_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: POP  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 67,
        title: "Breakin' Dishes",
        artist: 'Rihanna',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599223/ab67616d00001e02f9f27162ab1ed45b8d7a7e98.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599282/Breakin_Dishes_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 68,
        title: 'Dead to Me',
        artist: 'Kali Uchis',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e0290b4e1905b1fc48c537ec053.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599297/Dead_To_Me_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 69,
        title: 'Obsessed',
        artist: 'Mariah Carey',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599218/ab67616d0000e1a36ff3f8fd7540eb7447dae564.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599355/Obsessed_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 900,
        title: 'I Just Might',
        artist: 'Bruno Mars',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684137/ab67616d00001e023eb8dc748f7efb1470f74395.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682328/I_Just_Might_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 901,
        title: 'WHERE IS MY HUSBAND!',
        artist: 'RAYE',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a36ac3c7938191585c53c8180d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682308/WHERE_IS_MY_HUSBAND__spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 902,
        title: 'Your Teeth In My Neck',
        artist: 'Kali Uchis',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e0290b4e1905b1fc48c537ec053.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682371/Your_Teeth_In_My_Neck_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },
    {
        id: 903,
        title: 'Blow',
        artist: 'Kesha',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3d94f03f5cae0ba242a13178b.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682371/Blow_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1111,
        title: 'Beat It',
        artist: 'Michael Jackson',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a332a7d87248d1b75463483df5.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795642/Beat_It_spotdown.org.mp3',
        duration: 260,
        userIds: [0]
    },
    {
        id: 1112,
        title: 'Break My Heart',
        artist: 'Dua Lipa',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02c88bae7846e62a8ba59ee0bd.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795653/Break_My_Heart_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1113,
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a332a7d87248d1b75463483df5.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795656/Billie_Jean_spotdown.org.mp3',
        duration: 280,
        userIds: [0]
    },
    {
        id: 1114,
        title: 'The Way You Make Me Feel',
        artist: 'Michael Jackson',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02eb2087dcd1eb61f833bdedff.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795656/The_Way_You_Make_Me_Feel_-_2012_Remaster_spotdown.org.mp3',
        duration: 290,
        userIds: [0]
    },
    {
        id: 1115,
        title: 'Mystical Magical',
        artist: 'Benson Boone',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a33966ad1a94af993a41332d77.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795656/Mystical_Magical_spotdown.org.mp3',
        duration: 205,
        userIds: [0]
    },
    {
        id: 1116,
        title: 'Heaven Can Wait',
        artist: 'Michael Jackson',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795698/ab67616d00001e0276bfd700e0c47fae7f2c7b75.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795663/Heaven_Can_Wait_spotdown.org.mp3',
        duration: 285,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: HIP HOP  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 60,
        title: 'WE ON GO',
        artist: 'BIA',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599219/ab67616d0000e1a38b08b8fa3e0d46fd47f8dbf7.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599266/WE_ON_GO_spotdown.org.mp3',
        duration: 180,
        userIds: [0]
    },
    {
        id: 400,
        title: 'Monster',
        artist: 'Kanye West',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3d9194aa18fa4c9362b47464f.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682352/Monster_spotdown.org.mp3',
        duration: 360,
        userIds: [0]
    },
    {
        id: 401,
        title: 'POWER',
        artist: 'Kanye West',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3d9194aa18fa4c9362b47464f.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682343/POWER_spotdown.org.mp3',
        duration: 280,
        userIds: [0]
    },
    {
        id: 402,
        title: 'BURN',
        artist: 'Kanye West',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684130/ab67616d0000e1a39c654f315df05ae7c6ec8980.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682325/BURN_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 403,
        title: 'Delirium',
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02eeb01b41f48210d032d1b6a4.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682327/Delirium_feat._Mark_E._Smith__spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },
    {
        id: 404,
        title: 'The God of Lying',
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02eeb01b41f48210d032d1b6a4.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682317/The_God_of_Lying_feat._IDLES__spotdown.org.mp3',
        duration: 250,
        userIds: [0]
    },
    {
        id: 405,
        title: 'The Happy Dictator',
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02eeb01b41f48210d032d1b6a4.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682306/The_Happy_Dictator_feat._Sparks__spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },
    {
        id: 406,
        title: 'Plastic Beach',
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684132/ab67616d0000e1a3661d019f34569f79eae9e985.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682298/Plastic_Beach_feat._Mick_Jones_and_Paul_Simonon__spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 407,
        title: 'Touch The Sky',
        artist: 'Kanye West',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684132/ab67616d0000e1a3428d2255141c2119409a31b2.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682275/Touch_The_Sky_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 1123,
        title: "I'm Good Luv, Enjoy.",
        artist: 'Aaron May',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a3f0c12c7831413fddf24a1c1a.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795647/I_m_Good_Luv_Enjoy._spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 1124,
        title: 'Hello Miss Johnson',
        artist: 'Jack Harlow',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a31039ec791b25bf52050ef7fe.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795649/Hello_Miss_Johnson_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1125,
        title: 'Tokyo Drift',
        artist: 'Teriyaki Boyz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795696/ab67616d00001e02aac3b3863e8f7a43a9b65a19.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795650/Tokyo_Drift_Fast_Furious_-_From__The_Fast_And_The_Furious__Tokyo_Drift__Soundtrack_spotdown.org.mp3',
        duration: 260,
        userIds: [0]
    },
    {
        id: 1126,
        title: 'i',
        artist: 'Kendrick Lamar',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795698/ab67616d00001e026d89f336fbfbdf2089701da0.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795655/i_spotdown.org.mp3',
        duration: 235,
        userIds: [0]
    },
    {
        id: 1158,
        title: 'On Melancholy Hill',
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Hip Hop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684132/ab67616d0000e1a3661d019f34569f79eae9e985.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839342/On_Melancholy_Hill_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: MPB  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 70,
        title: 'Lágrimas',
        artist: 'Baco Exu do Blues',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599222/ab67616d00001e02e4f4bac5cfa8a7945ac12a82.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599320/L%C3%A1grimas_spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },
    {
        id: 71,
        title: 'Lisboa',
        artist: 'ANAVITÓRIA, Lenine',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599221/ab67616d00001e02b1e8a9fa2c21159ea637b766.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599340/Lisboa_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 72,
        title: 'Deusa',
        artist: 'BK, 2ZDinizz, Anchietx, Nansy Silvvz',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599222/ab67616d00001e02dd12836650253ee55aefc990.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599342/Deusa_spotdown.org.mp3',
        duration: 235,
        userIds: [0]
    },
    {
        id: 73,
        title: 'Beatriz',
        artist: '2ZDinizz, Leborato, HHR',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599223/ab67616d00001e02f8fc839361eacee6af4af11a.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599354/Beatriz_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 904,
        title: 'JETSKI',
        artist: 'PEDRO SAMPAIO',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684137/ab67616d00001e021f7ed7c8c424c74a5ee07f35.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682291/JETSKI_spotdown.org.mp3',
        duration: 195,
        userIds: [0]
    },
    {
        id: 905,
        title: 'PENSANDO EM MIM',
        artist: 'Matchola',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684136/ab67616d00001e021d3e1aa544727851b836e908.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682368/PENSANDO_EM_MIM_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1110,
        title: 'Quase Um Segundo',
        artist: 'Gal Costa',
        category: 'genre',
        genre: 'MPB',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795696/ab67616d00001e02c4a9eb4c4b7813f46e49df36.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795642/Quase_Um_Segundo_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: REGGAETON  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 74,
        title: 'DtMF',
        artist: 'Bad Bunny',
        category: 'genre',
        genre: 'Reggaeton',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599222/ab67616d00001e02bbd45c8d36e0e045ef640411.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599340/DtMF_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: UNDERGROUND  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 75,
        title: 'Jóias do Bairro',
        artist: 'LEALL, Borges, Rock Danger',
        category: 'genre',
        genre: 'Underground',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599218/ab67616d0000e1a3ba4fda5eb4b7b216e4efd3be.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786599348/J%C3%B3ias_do_Bairro_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: FORRÓ  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 40,
        title: 'Mágica',
        artist: 'Calcinha Preta',
        category: 'genre',
        genre: 'Forró',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d00001e020feadb03b09b02564d643132.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591693/M%C3%A1gica_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 41,
        title: 'Faço Chover (It Will Rain)',
        artist: 'Calcinha Preta',
        category: 'genre',
        genre: 'Forró',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786591723/ab67616d0000e1a3affbc662fdc4630890d21353.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786591692/Fa%C3%A7o_Chover_It_Will_Rain__spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 300,
        title: 'I Love You',
        artist: 'Dupê',
        category: 'genre',
        genre: 'Forró',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684133/ab67616d0000e1a3659844e850c85c1f0abd6d81.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682366/I_Love_You_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 1128,
        title: 'Última Noite',
        artist: 'Léo Foguete',
        category: 'genre',
        genre: 'Forró',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a3e8ee6a30da5e556e34ee6574.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795648/%C3%9Altima_Noite_-_Solo_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: ROCK  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 700,
        title: 'Come Out and Play',
        artist: 'The Offspring',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684139/ab67616d00001e020158cbde70672dd821972907.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682336/Come_Out_and_Play_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 701,
        title: 'Americana',
        artist: 'The Offspring',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02cbd2ee7dff77bfb2b5f0af52.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682303/Americana_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 702,
        title: 'Self Esteem',
        artist: 'The Offspring',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684139/ab67616d00001e020158cbde70672dd821972907.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682292/Self_Esteem_spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },
    {
        id: 703,
        title: 'Pretty Fly (For A White Guy)',
        artist: 'The Offspring',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02cbd2ee7dff77bfb2b5f0af52.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682285/Pretty_Fly_For_A_White_Guy__spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 704,
        title: 'ChilinDharma',
        artist: 'InDharma',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684128/ab67616d0000e1a3cedb490194c830a7240870ee.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682293/ChilinDharma_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1117,
        title: 'Master Of Puppets',
        artist: 'Metallica',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795698/ab67616d00001e02668e3aca3167e6e569a9aa20.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795645/Master_Of_Puppets_spotdown.org.mp3',
        duration: 510,
        userIds: [0]
    },
    {
        id: 1118,
        title: 'The Night Begin to Shine',
        artist: 'B.E.R',
        category: 'genre',
        genre: 'Rock',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a3eb90962c3abb70cf12ad4f9c.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795647/The_Night_Begin_to_Shine_spotdown.org.mp3',
        duration: 205,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: R&B  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 800,
        title: 'Superpowers',
        artist: 'Daniel Caesar',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02e242f18dafe885fcf425fe1f.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682326/Superpowers_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 801,
        title: 'The Largest',
        artist: 'BigXthaPlug',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684135/ab67616d00001e02fed9afd601a1732fdae85ea8.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682271/The_Largest_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1119,
        title: 'Beautiful',
        artist: 'Snoop Dogg, Pharrell Williams',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a38cdb0d29bb99ad4febccac39.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795646/Beautiful_spotdown.org.mp3',
        duration: 270,
        userIds: [0]
    },
    {
        id: 1120,
        title: 'I Wish you Roses',
        artist: 'Kali Uchis',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795698/ab67616d00001e0281fccd758776d16b87721b17.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795651/I_Wish_you_Roses_spotdown.org.mp3',
        duration: 225,
        userIds: [0]
    },
    {
        id: 1121,
        title: '(When You Gonna) Give It Up to Me',
        artist: 'Sean Paul',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d00001e02a539563b3d77bd3ba17d016e.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795652/When_You_Gonna_Give_It_Up_to_Me_-_Radio_Version_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 1122,
        title: 'Love Me',
        artist: 'JMSN',
        category: 'genre',
        genre: 'R&B',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a383541947535fe7841504d1b4.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795655/Love_Me_spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: J-POP  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 600,
        title: 'SEISHUN WO KIRISAKU HADO',
        artist: 'ATARASHII GAKKO!',
        category: 'genre',
        genre: 'J-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684134/ab67616d00001e02a7cff36d69e224ca1b489fa8.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682337/SEISHUN_WO_KIRISAKU_HADO_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 601,
        title: 'IRIS OUT',
        artist: 'Kenshi Yonezu',
        category: 'genre',
        genre: 'J-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a36d1d4e875e2424cdd07f3232.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682324/IRIS_OUT_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 602,
        title: 'OTONABLUE',
        artist: 'ATARASHII GAKKO!',
        category: 'genre',
        genre: 'J-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a3f98871b721be4cd034a3904f.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682308/OTONABLUE_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1129,
        title: '薄ら氷心中',
        artist: 'Sheena Ringo',
        category: 'genre',
        genre: 'J-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02e27c732793d914a687d4225c.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795653/%E8%96%84%E3%82%89%E6%B0%B7%E5%BF%83%E4%B8%AD_spotdown.org.mp3',
        duration: 245,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: K-POP  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1000,
        title: 'SPAGHETTI',
        artist: 'LE SSERAFIM',
        category: 'genre',
        genre: 'K-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786684129/ab67616d0000e1a36c4a726c271daf4a4b97e35b.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786682272/SPAGHETTI_spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 1150,
        title: 'STRATEGY',
        artist: 'Twice',
        category: 'genre',
        genre: 'K-POP',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e02acf8ff27be32aec99d6c99a0.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839334/Strategy_feat._Megan_Thee_Stallion__spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: FOLK  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1100,
        title: "Hell's Comin' with Me",
        artist: "Poor Man's Poison",
        category: 'genre',
        genre: 'Folk',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a302e31189bc79f1990d9f0f3c.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795641/Hell_s_Comin_with_Me_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1151,
        title: 'Providence',
        artist: "Poor Man's Poison",
        category: 'genre',
        genre: 'Folk',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839380/ab67616d00001e02e263f90f4c5d13eadcfe6c04.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839334/Providence_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },
    {
        id: 1152,
        title: 'Feed The Machine',
        artist: "Poor Man's Poison",
        category: 'genre',
        genre: 'Folk',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839380/ab67616d0000e1a3999247481fd9eec8afcabdc3.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839335/Feed_the_Machine_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: GOSPEL  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1101,
        title: 'Sacrifício',
        artist: 'Thalles Roberto',
        category: 'genre',
        genre: 'Gospel',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02d8676fedbd09b6f01ee2de81.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795645/Sacrif%C3%ADcio_spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },
    {
        id: 1102,
        title: 'Ele É o Amor',
        artist: 'Thalles Roberto',
        category: 'genre',
        genre: 'Gospel',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02d8676fedbd09b6f01ee2de81.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795647/Ele_%C3%89_o_Amor_spotdown.org.mp3',
        duration: 230,
        userIds: [0]
    },
    {
        id: 1155,
        title: 'Cheios do Espirito Santo',
        artist: 'Thalles Roberto',
        category: 'genre',
        genre: 'Gospel',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e02d8676fedbd09b6f01ee2de81.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839338/Cheios_do_Esp%C3%ADrito_Santo_spotdown.org.mp3',
        duration: 250,
        userIds: [0]
    },
    {
        id: 1156,
        title: 'O Que Queres de Mim',
        artist: 'Thalles Roberto',
        category: 'genre',
        genre: 'Gospel',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839378/ab67616d00001e027e1466b4707d82041f1a8587.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839346/O_Que_Queres_de_Mim_-_Ao_Vivo_spotdown.org.mp3',
        duration: 310,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: JAZZ  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1103,
        title: 'Feeling Good',
        artist: 'Michael Bublé',
        category: 'genre',
        genre: 'Jazz',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e024baba2a420140005081a91f2.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795652/Feeling_Good_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },
    {
        id: 1130,
        title: 'The World We Knew',
        artist: 'Frank Sinatra',
        category: 'genre',
        genre: 'Jazz',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839376/ab67616d0000e1a33e2331ff09f59ea3c87fe5d6.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839331/The_World_We_Knew_Over_And_Over__spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1131,
        title: "That's Life",
        artist: 'Frank Sinatra',
        category: 'genre',
        genre: 'Jazz',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d0000e1a3b81d66d1416afa139d12767b.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839331/That_s_Life_-_2008_Remastered_spotdown.org.mp3',
        duration: 195,
        userIds: [0]
    },
    {
        id: 1132,
        title: 'Virtual Insanity',
        artist: 'Jamiroquai',
        category: 'genre',
        genre: 'Jazz',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e0243a58a3269fa18d1e4f8b5ca.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839341/Virtual_Insanity_-_Remastered_2006_spotdown.org.mp3',
        duration: 260,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: SAMBA  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1153,
        title: 'Disritmia',
        artist: 'Casuarina',
        category: 'genre',
        genre: 'Samba',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d00001e027b9e0964a3da8315e9131a52.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839332/Disritmia_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1154,
        title: 'Mina Feia',
        artist: 'Seu Jorge',
        category: 'genre',
        genre: 'Samba',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839378/ab67616d0000e1a302c77637cc19ad1520c2b352.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839344/Mina_Feia_spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: METAL  (GLOBAL — todos veem, ID 0)
       ============================================================ */

    {
        id: 1133,
        title: 'GJ!',
        artist: 'BABYMETAL',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d0000e1a37ee1677ea6b0d68cc01984fb.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839331/GJ__spotdown.org.mp3',
        duration: 190,
        userIds: [0]
    },
    {
        id: 1135,
        title: 'Kool-Aid',
        artist: 'Bring Me The Horizon',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d00001e02df51a3d66223e5b01813e0c4.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839336/Kool-Aid_spotdown.org.mp3',
        duration: 225,
        userIds: [0]
    },
    {
        id: 1136,
        title: 'Freak on a Leash',
        artist: 'Korn',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839381/ab67616d00001e024e492e787ed64de43c3a3a21.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839336/Freak_On_a_Leash_spotdown.org.mp3',
        duration: 260,
        userIds: [0]
    },
    {
        id: 1137,
        title: 'Song 3',
        artist: 'BABYMETAL',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d0000e1a34b0ed3119e27ff6e56298053.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839337/Song_3_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1138,
        title: 'Hot Dog',
        artist: 'Limp Bizkit',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e024a31b146c7cf07705d912efe.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839340/Hot_Dog_spotdown.org.mp3',
        duration: 245,
        userIds: [0]
    },
    {
        id: 1139,
        title: 'Nookie',
        artist: 'Limp Bizkit',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e023783782de74f61e36795bf9c.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839343/Nookie_spotdown.org.mp3',
        duration: 255,
        userIds: [0]
    },
    {
        id: 1140,
        title: 'Blind',
        artist: 'Korn',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786589285/ab67616d00001e027153b1cf6ee990c2a9fa46cc.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839346/Blind_spotdown.org.mp3',
        duration: 280,
        userIds: [0]
    },
    {
        id: 1141,
        title: 'Take a Look Around',
        artist: 'Limp Bizkit',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d00001e024a31b146c7cf07705d912efe.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839346/Take_A_Look_Around_spotdown.org.mp3',
        duration: 310,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: INDIE — MÚSICAS ADICIONAIS (GLOBAL — ID 0)
       ============================================================ */

    {
        id: 1104,
        title: 'Glimpse of Us',
        artist: 'Joji',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a3f3f7d2ea2ad435b57d6697df.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795642/Glimpse_of_Us_spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 1105,
        title: 'Chamber Of Reflection',
        artist: 'Mac DeMarco',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a38b221f2ccf777ae0d4b0db50.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795644/Chamber_Of_Reflection_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1106,
        title: 'Breathe',
        artist: 'Malcolm Todd',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795697/ab67616d00001e026ad1bfc5a6102f8e926a8c5f.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795645/Breathe_spotdown.org.mp3',
        duration: 195,
        userIds: [0]
    },
    {
        id: 1107,
        title: 'You Owe Me',
        artist: 'Malcolm Todd',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795693/ab67616d0000e1a3ec2143e5aa8537a7de47b004.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795649/You_Owe_Me_spotdown.org.mp3',
        duration: 200,
        userIds: [0]
    },
    {
        id: 1108,
        title: 'Dracula (with JENNIE)',
        artist: 'Tame Impala, JENNIE',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795692/ab67616d0000e1a3c7c031ce9d06b131f8563676.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795651/Dracula_-_JENNIE_Remix_spotdown.org.mp3',
        duration: 225,
        userIds: [0]
    },
    {
        id: 1109,
        title: 'Concrete',
        artist: 'Malcolm Todd',
        category: 'genre',
        genre: 'Indie',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1787795695/ab67616d0000e1a387607b2c8f5f52f1f057be0d.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1787795652/Concrete_spotdown.org.mp3',
        duration: 205,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: POP — MÚSICAS ADICIONAIS (GLOBAL — ID 0)
       ============================================================ */

    {
        id: 1142,
        title: 'Goodbye Yellow Brick Road',
        artist: 'Elton John',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839379/ab67616d0000e1a3f72f1e38e9bd48f18a17ed9b.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839331/Goodbye_Yellow_Brick_Road_-_Remastered_2014_spotdown.org.mp3',
        duration: 235,
        userIds: [0]
    },
    {
        id: 1143,
        title: 'After The Storm',
        artist: 'Kali Uchis',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e0290b4e1905b1fc48c537ec053.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839331/After_The_Storm_feat._Tyler_The_Creator_Bootsy_Collins__spotdown.org.mp3',
        duration: 215,
        userIds: [0]
    },
    {
        id: 1144,
        title: "I'm Still Standing",
        artist: 'Elton John',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839380/ab67616d00001e02eb11e2abccdca41f39ad3b89.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839334/I_m_Still_Standing_spotdown.org.mp3',
        duration: 195,
        userIds: [0]
    },
    {
        id: 1145,
        title: 'Miami (feat. BIA)',
        artist: 'Kali Uchis',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786599224/ab67616d00001e0290b4e1905b1fc48c537ec053.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839338/Miami_feat._BIA__spotdown.org.mp3',
        duration: 220,
        userIds: [0]
    },
    {
        id: 1146,
        title: 'Be Like a Woman',
        artist: 'Chris Rainbow',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839377/ab67616d0000e1a3f96aee01fdb9a8d00db869c5.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839338/Be_Like_a_Woman_spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1147,
        title: "She's My Collar",
        artist: 'Gorillaz',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839380/ab67616d0000e1a3a5952c0e2e649f588603b743.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839342/She_s_My_Collar_feat._Kali_Uchis__spotdown.org.mp3',
        duration: 210,
        userIds: [0]
    },
    {
        id: 1148,
        title: 'Rock Your Body',
        artist: 'Justin Timberlake',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839378/ab67616d00001e02346a5742374ab4cf9ed32dee.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839340/Rock_Your_Body_spotdown.org.mp3',
        duration: 260,
        userIds: [0]
    },
    {
        id: 1149,
        title: 'Maneater',
        artist: 'Nelly Furtado',
        category: 'genre',
        genre: 'Pop',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839380/ab67616d00001e02a6f439c8957170652f9410e2.jpg',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839343/Maneater_spotdown.org.mp3',
        duration: 240,
        userIds: [0]
    },

    /* ============================================================
       GÊNERO: METAL — MÚSICAS EXCLUSIVAS (só Murilo, ID 1)
       ============================================================ */

    {
        id: 1134,
        title: 'mea culpa',
        artist: 'LVCAS',
        category: 'genre',
        genre: 'Metal',
        coverImage: 'https://res.cloudinary.com/oizv8icb/image/upload/v1788839378/ab67616d0000e1a3dd986b82796751ebedac22e4.webp',
        url: 'https://res.cloudinary.com/oizv8icb/video/upload/v1788839332/mea_culpa_spotdown.org.mp3',
        duration: 230,
        userIds: [1]
    }

];

/* ============================================================
   FUNÇÕES DE ACESSO / FILTRO
   ============================================================ */

/**
 * Retorna as músicas visíveis para um usuário específico.
 * Regras:
 *   - Se userIds contém 0  → todos veem
 *   - Se userIds contém userId → esse usuário vê
 *   - Sem duplicatas (usa title+artist como chave)
 */
function getVisibleSongs(userId) {
    const visible = baseSongs.filter(s =>
        s.userIds.includes(0) || s.userIds.includes(userId)
    );
    return getUniqueSongs(visible);
}

/**
 * Remove duplicatas mantendo apenas 1 ocorrência por (title + artist).
 */
function getUniqueSongs(songs) {
    const seen = new Set();
    const result = [];
    for (const s of songs) {
        const key = (s.title + '|||' + s.artist).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(s);
    }
    return result;
}

/**
 * Retorna a origem da música (álbum, playlist ou gênero).
 */
function getSongOrigin(song) {
    if (song.category === 'album')    return song.album;
    if (song.category === 'playlist') return song.playlist;
    if (song.category === 'genre')    return song.genre;
    return '';
}

/* ============================================================
   MUHSIC — REGISTER.JS
   Lógica de cadastro (só exemplo — NÃO SALVA em banco)
   ------------------------------------------------------------
   Este arquivo é apenas uma demonstração de como seria um
   fluxo de registro. Nenhum dado é persistido.
   ============================================================ */

/**
 * Valida e "cria" uma conta fictícia.
 * Na prática, apenas mostra uma mensagem de sucesso.
 */
function handleRegister() {
    const name  = document.getElementById('registerName').value.trim();
    const pass  = document.getElementById('registerPass').value.trim();
    const pass2 = document.getElementById('registerPass2').value.trim();
    const errEl = document.getElementById('registerError');

    errEl.textContent = '';

    // ---- Validações básicas ----
    if (!name || !pass || !pass2) {
        errEl.textContent = 'Preencha todos os campos.';
        return;
    }
    if (name.length < 3) {
        errEl.textContent = 'O nome precisa ter pelo menos 3 caracteres.';
        return;
    }
    if (pass.length < 4) {
        errEl.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
        return;
    }
    if (pass !== pass2) {
        errEl.textContent = 'As senhas não coincidem.';
        return;
    }

    // ---- Verifica se o nome já existe ----
    const exists = users.some(u => u.login.toLowerCase() === name.toLowerCase());
    if (exists) {
        errEl.textContent = 'Este nome de usuário já está em uso.';
        return;
    }

    // ---- Sucesso (fictício) ----
    errEl.style.color = '#1db954';
    errEl.textContent = 'Conta criada com sucesso! Faça login para continuar.';

    // Limpa os campos
    document.getElementById('registerName').value  = '';
    document.getElementById('registerPass').value  = '';
    document.getElementById('registerPass2').value = '';

    // Espera 1.5s e troca para o modal de login
    setTimeout(() => {
        errEl.style.color = '';
        errEl.textContent = '';
        closeModal('registerModal');
        openModal('loginModal');
    }, 1500);
}

/* ============================================================
   BIND DE EVENTOS (Register)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('registerButton');
    if (btn) btn.addEventListener('click', handleRegister);

    // Enter nos inputs
    ['registerName', 'registerPass', 'registerPass2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); handleRegister(); }
        });
    });
});