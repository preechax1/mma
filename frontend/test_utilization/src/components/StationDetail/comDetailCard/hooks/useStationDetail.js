import { useEffect, useState } from "react";
import {
    getReadIMG,
    getPM,
    getEquipment,
    getUtilizationSummary,
    getStatusDetail,
    getReadiness,
    getTestTimeline
} from "../../../../services/DetailCardService";

export default function useStationDetail(detail, isOpen) {

    const [images, setImages]                   = useState([]);
    const [pm, setPM]                           = useState(null);
    const [equipments, setEquipments]           = useState([]);
    const [summary, setSummary]                 = useState(null);
    const [loadingImages, setLoadingImages]     = useState(false);
    const [status,setStatus]                    = useState([]);
    const [readiness,setReadiness]              = useState(null);
    const [testtimeline,setTestTimeline]        = useState(null);

    useEffect(() => {

        if (!isOpen || !detail) return;

        loadImages();
        loadPM();
        loadEquipment();
        loadSummary();
        loadStatus();
        loadReadiness();
        loadTestTimeline(); 

    }, [detail, isOpen]);

    const loadImages = async () => {

        setLoadingImages(true);

        try {

            const res = await getReadIMG(detail.id_station);

            if (Array.isArray(res)) {
                setImages(res);
            }

        } catch (err) {

            console.error("loadImages", err);

        } finally {

            setLoadingImages(false);

        }

    };

    const loadPM = async () => {

        try {

            const res = await getPM(detail.id_station);

            if (Array.isArray(res) && res.length > 0) {
                setPM(res[0]);
            }

        } catch (err) {

            console.error("loadPM", err);

        }

    };

    const loadEquipment = async () => {

        try {

            const res = await getEquipment(detail.id_station);

            if (Array.isArray(res)) {
                setEquipments(res);
            }

        } catch (err) {

            console.error("loadEquipment", err);

        }

    };

    const loadSummary = async () => {

        try {

            const res = await getUtilizationSummary(detail.id_station);

            if (res) setSummary(res);

        } catch (err) {

            console.error("loadSummary", err);

        }

    };

    const loadStatus = async () => {

        try{

            const res = await getStatusDetail(detail.id_station);

            if(Array.isArray(res)){
                setStatus(res);
            }

        }catch(err){

            console.error("loadStatus",err);

        }

    };

    const loadReadiness = async () => {

        try{

            const res = await getReadiness(detail.id_station);
            setReadiness(res);

        }catch(err){
            console.error("loadReadiness",err);
        }

    };

    const loadTestTimeline = async () => {

        try{  
            const res = await getTestTimeline(detail.id_station);
            setTestTimeline(res);
        }catch(err){
            console.error("loadTestTimeline",err);
        } 
    };            

    return {
        images,
        pm,
        equipments,
        summary,
        loadingImages,
        status,
        readiness,
        testtimeline
    };
}
     