import styles from "./ImageSection.module.css";

export default function ImageGallery({ images, loading }) {

    if (loading) return <div className={styles.loadingText}>Loading images...</div>;

    return (
        <div className={styles.machineImg}>
            {images && images.length > 0 ? (
                <div className={styles.imageGallery}>
                    {images.slice(0, 3).map((img, index) => (
                        <img
                            key={index}
                            src={`http://localhost${img.file_url || img.url}`}
                            alt={`station-${index}`}
                            onError={(e) => (e.target.style.display = 'none')}
                            className={styles.galleryItem}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.placeholderWrapper}>
                    <img src="/machine.png" alt="machine placeholder" className={styles.placeholderImg}/>
                </div>
            )}
        </div>
    );
}