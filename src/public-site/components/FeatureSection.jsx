import "./FeatureSection.css";

function FeatureSection() {
    const features = [
        {
            title: "Quản lý Fanpage",
            description: "Kết nối và quản lý nhiều Fanpage."
        },
        {
            title: "AI Content",
            description: "Tạo nội dung tự động bằng AI."
        },
        {
            title: "Schedule",
            description: "Lên lịch đăng bài thông minh."
        }
    ];

    return (
        <section className="features">
            <h2>Tính năng nổi bật</h2>

            <div className="feature-grid">
                {features.map((item, index) => (
                    <div key={index} className="feature-card">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default FeatureSection;