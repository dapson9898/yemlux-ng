document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('li[data-section]');
    
    // Display and Collapse sidebar
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });

    // Navigate to sections
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            // showSection(sectionId);
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
        });
    });

    
});