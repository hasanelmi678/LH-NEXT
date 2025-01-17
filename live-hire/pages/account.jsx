import { withProtected } from '../hook/route';
import React, { useState, useEffect } from 'react';

import { AiOutlineCloseCircle, AiOutlineFilePdf } from 'react-icons/ai'
import { BiCloudUpload } from 'react-icons/bi'

import Header from '../components/header';
import WorkExperienceModal from '../components/workExperienceModal';
import EducationModal from '../components/educationModal';
import AccountErrorModal from '../components/accountErrorModal';
import SaveAccountSuccessModal from '../components/saveAccountSuccessModal';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from '../firebaseConfig';
import useAuth from '../hook/auth';
import Loading from '../components/loading';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { HiOutlineMail } from 'react-icons/hi'
import { GrLocation, GrAddCircle } from 'react-icons/gr'
import { CgLaptop } from 'react-icons/cg'
import { BiDetail } from 'react-icons/bi'


const Account = () => {
    const { user, error } = useAuth();

    const [userProfile, setUserProfile] = useState({
        userType: "job seeker",
        email: "",
        firstName: "",
        lastName: "",
        location: "",
        profileImage: null,
        resume: null
    })
    const [skills, setSkills] = useState([
        "react", "javascript", "css", "html"
    ])
    const [skill, setSkill] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);


    useEffect(() => {
        console.log("userProfile: ", userProfile)
    }, [userProfile])

    useEffect(() => {
        const getUserDetails = async () => {
            setSavingProfile(true);
            if (error === "" || error === undefined || user.uid !== null) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const { firstName, userType, email, lastName, location, profileImage, resume, skills, workExperienceList, educationList } = docSnap.data();
                    setUserProfile({
                        userType: userType ?? "job seeker",
                        email: email ?? "",
                        firstName: firstName ?? "",
                        lastName: lastName ?? "",
                        location: location ?? "",
                        profileImage: profileImage ?? null,
                        resume: resume ?? null
                    })
                    setSkills(skills ?? [])
                    setWorkExperienceList(workExperienceList ?? [])
                    setEducationList(educationList ?? [])
                    setSavingProfile(false);

                } else {
                    console.log("No such document!");
                    setSavingProfile(false);
                }
            }
            setSavingProfile(false);
        }
        getUserDetails();
    }, [])

    const getUserDetails = async () => {
        setSavingProfile(true);
        if (error === "" || error === undefined || user.uid !== null) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const { firstName, userType, email, lastName, location, profileImage, resume, skills, workExperienceList, educationList } = docSnap.data();
                setUserProfile({
                    userType: userType ?? "job seeker",
                    email: email ?? "",
                    firstName: firstName ?? "",
                    lastName: lastName ?? "",
                    location: location ?? "",
                    profileImage: profileImage ?? null,
                    resume: resume ?? null
                })
                setSkills(skills ?? [])
                setWorkExperienceList(workExperienceList ?? [])
                setEducationList(educationList ?? [])
                setSavingProfile(false);

            } else {
                console.log("No such document!");
                setSavingProfile(false);
            }
        }
        setSavingProfile(false);
    }

    const saveUserProfile = async () => {
        setSavingProfile(true);
        if (userProfile.userType !== "" && userProfile.email !== "" && userProfile.firstName !== "" &&
            userProfile.lastName !== "" && userProfile.location !== "") {
            // Save the new user profile
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userProfile, { merge: true });
            await getUserDetails();
            setErrorMessage("Your details have been successfully saved.")
            setShowSaveAccountSuccessModal(true);
        } else {
            // alert("Fill in all fields please.");
            setSavingProfile(false);
            setShowAccountErrorModal(true);
            setErrorMessage("Please fill in all the fields on the form. Including the email, first name, last name and location.")
        }
    }


    const [workExperienceList, setWorkExperienceList] = useState([
        {
            companyName: "Facebook", jobTitle: "Software Engineer",
            from: "2020-10-12", till: "2022-10-12", shortDesc: "Hello there abc twent four seven"
        },
        {
            companyName: "Twitter", jobTitle: "Software Engineer",
            from: "2020-10-12", till: "2022-10-12", shortDesc: "Hello there abc twent four seven"
        },
    ])

    const [educationList, setEducationList] = useState([
        { courseName: "Computer Science", universityName: "DeMontfort University", from: "2020-10-12", till: "2022-10-12" }
    ])

    const [showWorkExperienceModal, setShowWorkExperienceModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [showAccountErrorModal, setShowAccountErrorModal] = useState(false);
    const [showSaveAccountSuccessModal, setShowSaveAccountSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);


    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    const deleteExperience = async (exp) => {
        console.log("Experience to be deleted: ", exp);
        let tempArr = [...workExperienceList];
        tempArr = tempArr.filter(e => e.companyName.toLowerCase() !== exp.toLowerCase());
        console.log("Experience after delete: ", tempArr)
        setWorkExperienceList(tempArr);
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { workExperienceList: tempArr }, { merge: true });
    }

    const deleteEducation = async (course) => {
        let tempArr = [...educationList];
        tempArr = tempArr.filter(e => e.courseName.toLowerCase() !== course.toLowerCase());
        setEducationList(tempArr);
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { educationList: tempArr }, { merge: true });
    }


    const addSkill = async () => {
        if (skill === "") {
            // alert("Enter a skill")
            setShowAccountErrorModal(true);
            setErrorMessage("Please enter a skill into the input value")
        } else {
            if (!skills.includes(skill.toLowerCase())) {
                let tempArr = [...skills];
                tempArr.push(skill.toLowerCase());
                setSkills(tempArr)
                setSkill("");
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { skills: tempArr }, { merge: true });
                // await getUserDetails();
            } else {
                // alert("Skill already added.")
                setShowAccountErrorModal(true);
                setErrorMessage(`'${toTitleCase(skill)}' is already added.`)
            }
        }
    }

    const deleteSkill = async (skillName) => {
        let tempArr = [...skills]
        tempArr = tempArr.filter(e => e !== skillName);
        setSkills(tempArr)
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { skills: tempArr }, { merge: true });
        // await getUserDetails();
        setErrorMessage(`'${skillName}' successfully removed`)
        setShowSaveAccountSuccessModal(true);
    }


    const profileImageUploaded = async (event) => {

        const storageRef = ref(storage, `/profileimage/${event.target.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, event.target.files[0]);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        // setProgress(progress)
                        break;
                }
            },
            (error) => {
                console.log("Failed upload: ", error)
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    setUserProfile({ ...userProfile, profileImage: downloadURL })
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { profileImage: downloadURL }, { merge: true });
                    console.log('File available at', downloadURL);
                    setErrorMessage(`Profile Image successfully uploaded`)
                    setShowSaveAccountSuccessModal(true);
                });
            }
        );
    }

    const resumeUpload = async (event) => {

        const storageRef = ref(storage, `/resume/${event.target.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, event.target.files[0]);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        // setProgress(progress)
                        break;
                }
            },
            (error) => {
                console.log("Failed upload: ", error)
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    setUserProfile({ ...userProfile, resume: downloadURL })
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { resume: downloadURL }, { merge: true });
                    console.log('File available at', downloadURL);
                    setErrorMessage(`Resume successfully uploaded.`)
                    setShowSaveAccountSuccessModal(true);
                });
            }
        );
    }




    return (
        <>
            <Header />
            {savingProfile ? <Loading /> : (
                <div className="accounts-page">
                    <div className="accounts-heading">
                        <h2>My Account</h2>
                    </div>
                    <div className="columns">

                        <div className="accounts-container column is-7">
                            <div className="heading">
                                <h2>User Information</h2>
                                <p>
                                    Enter the required information below to complete your profile.
                                    You can change it any time you want.
                                </p>
                            </div>
                            <div className="field user-type">
                                <label className="label">User type</label>
                                <div className="control">
                                    <button
                                        className={userProfile.userType === "job seeker" ?
                                            "button job-seeker selected" : "button job-seeker"}
                                        onClick={() => setUserProfile({ ...userProfile, userType: "job seeker" })}>
                                        Job Seeker
                                    </button>
                                    <button
                                        className={userProfile.userType === "employer" ?
                                            "button employer selected" : "button employer"}
                                        onClick={() => setUserProfile({ ...userProfile, userType: "employer" })}>
                                        Employer
                                    </button>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Email</label>
                                <div className="control has-icons-left email-control">
                                    <span className="icon is-small is-left">
                                        <HiOutlineMail />
                                    </span>
                                    <input className="input" type="email" placeholder="Email address" value={userProfile.email}
                                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="names-fields">
                                <div className="field">
                                    <label className="label">First Name</label>
                                    <div className="control has-icons-left">
                                        <span className="icon is-small is-left">

                                            <BiDetail />
                                        </span>
                                        <input className="input" type="text" placeholder="First Name"
                                            value={userProfile.firstName}
                                            onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Last Name</label>
                                    <div className="control has-icons-left">
                                        <span className="icon is-small is-left">
                                            <BiDetail />
                                        </span>
                                        <input className="input" type="text" placeholder="Last Name"
                                            value={userProfile.lastName}
                                            onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="field select-field">
                                <label className="label">Location</label>
                                <div className="select control has-icons-left">
                                    <span className="icon is-small is-left">
                                        <GrLocation />
                                    </span>
                                    <div className="select">

                                        <select value={userProfile.location} onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}>
                                            <option value="">Select your continent</option>
                                            <option value="africa">Africa</option>
                                            <option value="australia">Australia</option>
                                            <option value="asia">Asia</option>
                                            <option value="europe">Europe</option>
                                            <option value="south america">South America</option>
                                            <option value="united kingdom">United Kingdom</option>
                                            <option value="united states">United States</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="field skills-field">
                                <label className="label">Skills</label>
                                <div className="control has-icons-left">
                                    <span className="icon is-small is-left">
                                        <CgLaptop />
                                    </span>
                                    <input className="input" type="text" placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
                                </div>

                                <div className="control">
                                    <button className="button is-primary is-small is-outlined my-2 add-skill-button"
                                        onClick={addSkill}>
                                        <span className="icon">
                                            <GrAddCircle />
                                        </span>
                                        <span>Add skill</span>
                                    </button>
                                </div>

                                <div className="skills-list">
                                    {skills?.map((skill, index) => (

                                        <p
                                            className={index % 2 === 0 ? "tag is-warning is-light" : "tag is-link is-light"}
                                            onClick={() => deleteSkill(skill)}
                                            key={index}>
                                            <span>{toTitleCase(skill)}</span>
                                            <AiOutlineCloseCircle />
                                        </p>



                                    ))}
                                </div>
                            </div>


                            <div className="heading" style={{ marginTop: '40px' }}>
                                <h2>Work experience</h2>
                            </div>

                            {workExperienceList.map((experience, index) => (
                                <div className="experience-container" key={index}>
                                    <div className="experience-fields">
                                        <p className="company-name">{experience.companyName}</p>
                                        <p className="job-title">{experience.jobTitle}</p>
                                        <p className="dates">{experience.from} - {experience.till}</p>
                                        <p className="desc">{experience.shortDesc}</p>
                                    </div>

                                    <button className="button is-small is-light is-outlined"
                                        onClick={() => deleteExperience(experience.companyName)}>X</button>
                                </div>
                            ))}

                            <button className="button is-primary is-light is-small is-outlined add-skill-button"
                                onClick={() => setShowWorkExperienceModal(true)}>
                                <span className="icon">
                                    <GrAddCircle />
                                </span>
                                <span>Add new work experience</span>
                            </button>


                            <div className="heading" style={{ marginTop: '40px' }}>
                                <h2>Education or certifications</h2>
                            </div>

                            {educationList.map((education, index) => (
                                <div className="experience-container" key={index}>
                                    <div className="experience-fields">
                                        <p className="company-name">{education.courseName}</p>
                                        <p className="job-title">{education.universityName}</p>
                                        <p className="dates">{education.from} - {education.till}</p>
                                    </div>
                                    <button className="button is-small is-light is-outlined"
                                        onClick={() => deleteEducation(education.courseName)}>X</button>
                                </div>
                            ))}

                            <button className="button is-primary is-light is-small is-outlined add-skill-button"
                                onClick={() => setShowEducationModal(true)}>
                                <span className="icon">
                                    <GrAddCircle />
                                </span>
                                <span>Add new education</span>
                            </button>



                        </div>

                        <div className="column profile-section">
                            <div className="heading">
                                <h2>Profile Image</h2>
                            </div>

                            <div className="profile-image">
                                <img src={userProfile.profileImage ? userProfile.profileImage : "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"} />
                            </div>

                            <div className="image-upload">
                                <div className="file is-boxed">
                                    <label className="file-label">
                                        <input className="file-input" type="file" name="resume" onChange={profileImageUploaded} />
                                        <span className="file-cta">
                                            <span className="file-icon">
                                                <BiCloudUpload />
                                            </span>
                                            <span className="file-label">
                                                Choose a file…
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="resume-section">
                                <div className="heading">
                                    <h2>Resume Upload</h2>
                                </div>

                                <div className="profile-image">
                                    <div className="resume-preview">
                                        {userProfile.resume ? (
                                            <a href={userProfile.resume} className="view-resume-button">
                                                <div className="icon">
                                                    <AiOutlineFilePdf />
                                                </div>
                                                <span>View Resume</span>
                                            </a>
                                        ) : (
                                            <AiOutlineFilePdf />
                                        )}
                                    </div>
                                </div>

                                <div className="image-upload">
                                    <div className="file is-boxed">
                                        <label className="file-label">
                                            <input className="file-input" type="file" name="resume" onChange={resumeUpload} />
                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    <BiCloudUpload />
                                                </span>
                                                <span className="file-label">
                                                    Choose a file…
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    {showWorkExperienceModal && (
                        <WorkExperienceModal showWorkExperienceModal={showWorkExperienceModal}
                            setShowWorkExperienceModal={setShowWorkExperienceModal}
                            workExperienceList={workExperienceList}
                            setWorkExperienceList={setWorkExperienceList}
                            setErrorMessage={setErrorMessage}
                            setShowAccountErrorModal={setShowAccountErrorModal}
                        />
                    )}
                    {showEducationModal && (
                        <EducationModal showEducationModal={showEducationModal}
                            setShowEducationModal={setShowEducationModal}
                            educationList={educationList}
                            setEducationList={setEducationList}
                            setErrorMessage={setErrorMessage}
                            setShowAccountErrorModal={setShowAccountErrorModal}
                        />
                    )}
                    {showAccountErrorModal && (
                        <AccountErrorModal
                            setErrorMessage={setErrorMessage}
                            errorMessage={errorMessage}
                            showAccountErrorModal={showAccountErrorModal}
                            setShowAccountErrorModal={setShowAccountErrorModal} />
                    )}
                    {showSaveAccountSuccessModal && (
                        <SaveAccountSuccessModal
                            setErrorMessage={setErrorMessage}
                            errorMessage={errorMessage}
                            showSaveAccountSuccessModal={showSaveAccountSuccessModal}
                            setShowSaveAccountSuccessModal={setShowSaveAccountSuccessModal} />
                    )}
                    <div className="save-changes">
                        <button className="button is-link is-outlined" onClick={saveUserProfile}>Save all changes</button>
                    </div>
                </div>
            )}
        </>

    )
};

export default withProtected(Account);