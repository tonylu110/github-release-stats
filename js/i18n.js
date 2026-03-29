var i18n = {
    currentLang: 'en',
    messages: {},
    
    init: function() {
        var savedLang = localStorage.getItem('lang');
        if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
            this.currentLang = savedLang;
        } else {
            var browserLang = navigator.language || navigator.userLanguage;
            this.currentLang = browserLang.startsWith('zh') ? 'zh' : 'en';
            localStorage.setItem('lang', this.currentLang);
        }
        
        this.loadMessages();
    },
    
    loadMessages: function() {
        var en = {
            'title': 'Github Release Stats',
            'description': 'Get the latest release stats like download counts, release dates, author on any Github project',
            'keywords': 'Github, release, download, count',
            'toggleNav': 'Toggle navigation',
            'viewOnGithub': 'View project on Github',
            'enterProjectDetails': 'Enter project details...',
            'githubUsername': 'Github username',
            'repositoryName': 'Repository name',
            'getStats': 'Get the latest release stats!',
            'statsDescription': '...and get the latest release stats like download counts, release dates, authors for any Github project.',
            'releaseStats': 'release stats',
            'newer': 'Newer',
            'older': 'Older',
            'perPage': 'Per page',
            'downloadInfo': 'Download Info',
            'releaseInfo': 'Release Info',
            'author': 'Author',
            'published': 'Published',
            'downloads': 'Downloads',
            'totalDownloads': 'Total Downloads',
            'latestRelease': 'Latest release',
            'preRelease': 'Pre-release',
            'projectNotExist': 'The project does not exist!',
            'rateLimitExceeded': "You've exceeded GitHub's rate limiting.<br />Please try again in about an hour.",
            'noMoreReleases': 'No more releases',
            'noReleases': 'There are no releases for this project',
            'lastUpdated': 'Last updated on',
            'times': 'times',
            'mib': 'MiB',
            'language': 'Language',
            'chinese': '中文',
            'english': 'English',
            'titleDescription': 'release stats'
        };
        
        var zh = {
            'title': 'Github 发布统计',
            'description': '获取任何 Github 项目的最新发布统计信息，如下载次数、发布日期、作者等',
            'keywords': 'Github, 发布, 下载, 统计',
            'toggleNav': '切换导航',
            'viewOnGithub': '在 Github 上查看项目',
            'enterProjectDetails': '输入项目信息...',
            'githubUsername': 'Github 用户名',
            'repositoryName': '项目名称',
            'getStats': '获取最新发布统计！',
            'statsDescription': '...获取任何 Github 项目的最新发布统计信息，如下载次数、发布日期、作者等。',
            'releaseStats': '发布统计',
            'newer': '较新',
            'older': '较旧',
            'perPage': '每页显示',
            'downloadInfo': '下载信息',
            'releaseInfo': '发布信息',
            'author': '作者',
            'published': '发布于',
            'downloads': '下载次数',
            'totalDownloads': '总下载次数',
            'latestRelease': '最新发布',
            'preRelease': '预发布',
            'projectNotExist': '该项目不存在！',
            'rateLimitExceeded': '您已超过 GitHub 的速率限制。<br />请在大约一小时后重试。',
            'noMoreReleases': '没有更多发布版本',
            'noReleases': '该项目没有发布版本',
            'lastUpdated': '最后更新于',
            'times': '次',
            'mib': 'MiB',
            'language': '语言',
            'chinese': '中文',
            'english': 'English',
            'titleDescription': '发布统计'
        };
        
        this.messages = {
            'en': en,
            'zh': zh
        };
    },
    
    t: function(key) {
        var msg = this.messages[this.currentLang];
        return msg && msg[key] ? msg[key] : this.messages['en'][key] || key;
    },
    
    setLang: function(lang) {
        if (lang === 'en' || lang === 'zh') {
            this.currentLang = lang;
            localStorage.setItem('lang', lang);
        }
    },
    
    getLang: function() {
        return this.currentLang;
    }
};

i18n.init();
