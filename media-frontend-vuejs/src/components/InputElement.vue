<script>
export default {
    name: 'input-element',
    props: {
        initial: {
            required: true,
            default: true
        },
        inputValue: {
            required: true,
        },
        index: {
            required: true,
            type: Number
        }
    },
    data: () => {
        return {
            file: null,
            fileRules: [
                value => !!value[0] || "File is required",
                value => {
                    if (!value || !value[0]) return true;
                    const allowedExtensions = ["jpeg", "png", "mp4", "mp3"];
                    const file = value[0]
                    const fileExtension = file.name.split(".").pop().toLowerCase();
                    if (!allowedExtensions.includes(fileExtension)) {
                        return "Invalid file type. Only JPEG, PNG, MP4 and MP3 files are allowed.";
                    }
                    if (fileExtension === "jpeg") {
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        return new Promise((resolve, reject) => {
                            img.onload = () => {
                                if (img.width < 1080) {
                                    reject("Image should be at least 1080p");
                                } else if (file.size > 3 * 1024 * 1024) {
                                    reject("Image should not be greater than 3MB");
                                } else {
                                    resolve(true);
                                }
                            };
                        }).catch(err => {
                            return err
                        });
                    }
                    if (fileExtension === "mp4") {
                        const video = document.createElement("video");
                        video.src = URL.createObjectURL(file);
                        return new Promise((resolve, reject) => {
                            video.onloadedmetadata = () => {
                                if (video.videoWidth < 1280 || video.videoHeight < 720) {
                                    reject("Video should be at least 720p");
                                } else if (video.duration > 60) {
                                    reject("Video should not be longer than 1 minute");
                                } else {
                                    resolve(true);
                                }
                            };
                        }).catch(err => {
                            return err
                        });
                    }
                    if (fileExtension === "mp3") {
                        const audio = document.createElement("audio");
                        audio.src = URL.createObjectURL(file);
                        return new Promise((resolve, reject) => {
                            audio.onloadedmetadata = () => {
                                if (audio.duration > 60) {
                                    reject("Audio should not be longer than 1 minute");
                                } else {
                                    resolve(true);
                                }
                            };
                        }).catch(err => {
                            return err
                        });
                    }
                    return true;
                },
            ]
        }
    },
    methods: {
        handleFileUpload(event) {
            this.$nextTick(() => {
                this.$refs.fileInput.validate().then(valid => {
                    if (valid) {
                        this.$emit('fileUploadInput', {
                            value: event.target.files[0],
                            index: this.index
                        })
                    }
                })
            })
        },
        clearHandler() {
            this.$emit('fileUploadInput', {
                value: '',
                index: this.index
            })
        }
    }
}
</script>
<!--- accept="image/png, image/jpeg, video/mp4, audio/mp3" -->
<template>
    <div class="wrapper">
        <div class="file-input-elements">
            <v-file-input :rules="fileRules" ref="fileInput" show-size @click:clear="clearHandler"
                @change="handleFileUpload($event)" placeholder="Pick an avatar" prepend-icon="mdi-camera" label="Media">
            </v-file-input>

            <v-btn class="ma-2" color="purple" icon="mdi-plus-box" @click="$emit('addMoreFile')">

            </v-btn>
            <v-btn class="ma-2" color="red" icon="mdi-minus-box" v-if="!initial" @click="$emit('removeFile', index)">
            </v-btn>
        </div>
    </div>
</template>

<style scoped>
.file-input-elements {
    display: flex;
    padding: 10px;
    align-items: flex-start;
}
</style>